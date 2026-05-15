import { createContext } from "@light/api/context"
import { appRouter } from "@light/api/routers/index"
import * as Sentry from "@sentry/tanstackstart-react"
import { createFileRoute } from "@tanstack/react-router"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

function handler({ request }: { request: Request }) {
  return fetchRequestHandler({
    req: request,
    router: appRouter,
    createContext,
    endpoint: "/api/trpc",
    onError: ({ error, path, input }) => {
      console.error("tRPC error", {
        path,
        error: error.message,
        cause: error.cause,
      })

      Sentry.withScope((scope) => {
        scope.setTag("trpc_path", path ?? "unknown")
        scope.setExtra("input", input)
        scope.setExtra("error_code", error.code)
        Sentry.captureException(error.cause ?? error)
      })
    },
  })
}

export const Route = createFileRoute("/api/trpc/$")({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
})
