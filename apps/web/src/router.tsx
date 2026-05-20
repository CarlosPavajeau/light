import type { AppRouter } from "@light/api/routers/index"
import * as Sentry from "@sentry/tanstackstart-react"

import "./index.css"
import { QueryCache, QueryClient } from "@tanstack/react-query"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { createTRPCClient, httpBatchLink } from "@trpc/client"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"

import Loader from "./components/loader"
import { routeTree } from "./routeTree.gen"
import { TRPCProvider } from "./utils/trpc"

export const queryClient = new QueryClient({
  queryCache: new QueryCache(),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
})

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        })
      },
    }),
  ],
})

const trpc = createTRPCOptionsProxy({
  client: trpcClient,
  queryClient,
})

export const getRouter = () => {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: { trpc, queryClient },
    defaultPendingComponent: () => <Loader />,
    defaultNotFoundComponent: () => <div>Not Found</div>,
    Wrap: ({ children }) => (
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    ),
  })

  if (!router.isServer) {
    Sentry.init({
      dsn: "https://5f8b3841c49e7960313979e8f8efb42f@o4503956764950528.ingest.us.sentry.io/4511395301883904",

      // Adds request headers and IP for users, for more info visit:
      // https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
      sendDefaultPii: true,

      integrations: [Sentry.replayIntegration()],

      // Capture Replay for 0% of all sessions,
      // plus for 100% of sessions with an error.
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1,
    })
  }

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}

declare module "@tanstack/react-router" {
  type Register = {
    router: ReturnType<typeof getRouter>
  }
}
