import { defineConfig } from "oxlint"
import core from "ultracite/oxlint/core"
import react from "ultracite/oxlint/react"

export default defineConfig({
  extends: [core, react],
  rules: {
    "sort-keys": "off",
    "func-style": "off",
    "no-use-before-define": [
      "warn",
      {
        classes: true,
        functions: false,
        variables: true,
      },
    ],
    "typescript/consistent-type-definitions": ["error", "type"],
  },
})
