import type { AppRouter } from "@light/api/routers/index"
import { Toaster } from "@light/ui/components/sonner"
import { TooltipProvider } from "@light/ui/components/tooltip"
import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query"

import appCss from "../index.css?url"
import geist from "@fontsource-variable/geist/wght.css?url"

export type RouterAppContext = {
  trpc: TRPCOptionsProxy<AppRouter>
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "LUMEN888",
      },
    ],
    links: [
      {
        href: geist,
        rel: "stylesheet",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
})

function RootDocument() {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>
          <div className="grid h-svh grid-rows-[auto_1fr]">
            <Outlet />
          </div>
        </TooltipProvider>
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
