import * as Sentry from "@sentry/tanstackstart-react"

Sentry.init({
  dsn: "https://5f8b3841c49e7960313979e8f8efb42f@o4503956764950528.ingest.us.sentry.io/4511395301883904",

  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
})
