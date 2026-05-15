import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    sentryTanstackStart({
      org: "cantte",
      project: "light",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    nitro({
      traceDeps: ["react", "react-dom"],
    }),
    viteReact(),
  ],
})
