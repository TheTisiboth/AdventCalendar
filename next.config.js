import withPWA from "@ducanh2912/next-pwa"

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "100mb"
        },
        proxyClientMaxBodySize: "100mb"
    },
    turbopack: {},
    output: "standalone"
}

export default withPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
    buildExcludes: [/middleware-manifest\.json$/]
})(nextConfig)
