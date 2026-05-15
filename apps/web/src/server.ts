import * as Sentry from "@sentry/tanstackstart-react"
import { wrapFetchWithSentry } from "@sentry/tanstackstart-react"
import handler, { createServerEntry } from "@tanstack/react-start/server-entry"

Sentry.init({
  dsn: "https://5f8b3841c49e7960313979e8f8efb42f@o4503956764950528.ingest.us.sentry.io/4511395301883904",
  sendDefaultPii: true,
})

export default createServerEntry(
  wrapFetchWithSentry({
    fetch(request: Request) {
      return handler.fetch(request)
    },
  })
)
