import { z } from "zod"

/**
 * Environment variable schema definition with Zod validation.
 * This is the single source of truth for all environment variables in the application.
 */
const envSchema = z.object({
    // Node.js Environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Database Configuration
    DATABASE_URL: z.url(),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),

    // AWS S3 Configuration
    AWS_REGION: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    AWS_S3_BUCKET_NAME: z.string().min(1),

    // CDN/CloudFront Configuration
    NEXT_PUBLIC_CDN_URL: z.url(),
    CLOUDFRONT_KEY_PAIR_ID: z.string().min(1),
    CLOUDFRONT_PRIVATE_KEY: z
        .string()
        .min(1)
        .transform((key) => {
            // Normalize the private key format (handle escaped newlines)
            return key
                .replace(/\\n/g, "\n")
                .split("\n")
                .map((line) => line.trim())
                .join("\n")
        }),

    // Kinde Authentication (Build-time)
    KINDE_CLIENT_ID: z.string().min(1),
    KINDE_CLIENT_SECRET: z.string().min(1),
    KINDE_ISSUER_URL: z.url(),
    KINDE_SITE_URL: z.url(),
    KINDE_POST_LOGOUT_REDIRECT_URL: z.url(),
    KINDE_POST_LOGIN_REDIRECT_URL: z.url(),

    // Kinde Authentication (Runtime - M2M for admin features)
    KINDE_M2M_CLIENT_ID: z.string().min(1),
    KINDE_M2M_CLIENT_SECRET: z.string().min(1)
})

/**
 * Type-safe environment configuration type.
 */
export type Env = z.infer<typeof envSchema>

/**
 * Parse and validate environment variables.
 * Throws a detailed error if validation fails.
 */
function parseEnv(): Env {
    // Skip validation during build time since runtime env vars aren't available yet
    if (process.env.NEXT_PHASE === "phase-production-build") {
        return {} as Env
    }

    const result = envSchema.safeParse(process.env)

    if (!result.success) {
        console.error("❌ Invalid environment variables:")
        console.error(JSON.stringify(z.treeifyError(result.error), null, 2))
        throw new Error("Invalid environment variables. Check the errors above.")
    }

    return result.data
}

/**
 * Validated environment configuration.
 * This object is the single source of truth for accessing environment variables.
 */
export const env = parseEnv()
