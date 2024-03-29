import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            injectRegister: "auto",
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
                disableDevLogs: true
            },
            devOptions: {
                enabled: true,
                // suppressWarnings: true,
                type: "module"
            },
            includeAssets: ["favicon.ico", "apple-touch-icon.png", "safari-pinned-tab.svg"],
            manifest: {
                name: "Advent calendar app",
                short_name: "Advent calendar",
                description: "This is an Advent calendar web app",
                theme_color: "#ffffff",
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png"
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png"
                    }
                ]
            }
        })
    ]
})
