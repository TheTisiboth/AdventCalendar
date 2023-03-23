import * as AWS from "aws-sdk";
import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { getSignedCookies } from "@aws-sdk/cloudfront-signer";
import { Handler } from "@netlify/functions";





export const handler: Handler = async (event, context) => {
    const PRIVATE_KEY_SECRET_COMPLETE_ARN = "arn:aws:secretsmanager:eu-central-1:691132225608:secret:signed-cookie-CAmugq"
    const DOMAIN_NAME = "paula.leojan.fr"
    const KEY_PAIR_ID = process.env.KEY_PAIR_ID!

    const allowedOrigins = [
        `https://paula.leojan.fr`,
        `http://localhost:[0-9]*`, // for local development
    ];
    const origin = event.headers.Origin || event.headers.origin;
    // if (!allowedOrigins.some((allowedOrigin) => origin?.match(allowedOrigin))) {
    //     return {
    //         statusCode: 403,
    //         headers: {
    //             "Content-Type": "text/plain",
    //             "Access-Control-Allow-Credentials": "true",
    //             "Access-Control-Allow-Origin": allowedOrigins[0],
    //         },
    //         body: "bad origin",
    //     };
    // }

    const secret_name = "signed-cookie";

    const client = new SecretsManagerClient({
        region: "eu-central-1",
        credentials: {
            accessKeyId: process.env.ACCESS_KEY_ID!,
            secretAccessKey: process.env.SECRET_ACCESS_KEY!,
        }
    });

    // Generate Signed Cookie
    const res = await client.send(
        new GetSecretValueCommand({
            SecretId: secret_name,
            VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        })
    );
    console.log("secret", res)

    const privateKeyString = res.SecretString?.split(String.raw`\n`).join('\n').split(":")[1].split("}")[0].split('"')[1]!
    console.log("privateKeyString", privateKeyString)
    // expires in 1 hour
    const expires = Math.floor(new Date().getTime() / 1000) + 60 * 60;
    const signer = new AWS.CloudFront.Signer(KEY_PAIR_ID!, privateKeyString);

    const policy = {
        Statement: [
            {
                Resource: "*",
                Condition: {
                    DateLessThan: {
                        'AWS:EpochTime': expires.toString()
                    },
                },
            },
        ],
    }
    const signedCookies = signer.getSignedCookie({
        policy: JSON.stringify(policy),
    });

    const cookies: string[] = [];
    cookies.push(
        `CloudFront-Expires=${signedCookies["CloudFront-Expires"]};Domain=${DOMAIN_NAME};HttpOnly;Secure;SameSite=None`
    );
    cookies.push(
        `CloudFront-Key-Pair-Id=${signedCookies["CloudFront-Key-Pair-Id"]};Domain=${DOMAIN_NAME};HttpOnly;Secure;SameSite=None`
    );
    cookies.push(
        `CloudFront-Signature=${signedCookies["CloudFront-Signature"]};Domain=${DOMAIN_NAME};HttpOnly;Secure;SameSite=None`
    );

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": origin!,
            "Access-Control-Allow-Credentials": "true",
        },
        multiValueHeaders: {
            "Set-Cookie": cookies,
        },
        body: "ok",
    };
};
