import { i18n } from "@better-auth/i18n"
import { createDb } from "@light/db"
import * as schema from "@light/db/schema/auth"
import { env } from "@light/env/server"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin } from "better-auth/plugins"
import { tanstackStartCookies } from "better-auth/tanstack-start"

export function createAuth() {
  const db = createDb()

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",

      schema,
      usePlural: true,
    }),
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    plugins: [
      admin(),
      i18n({
        translations: {
          es: {
            ACCOUNT_NOT_FOUND: "La cuenta no fue encontrada",
            USER_NOT_FOUND: "El usuario no fue encontrado",
            USER_EMAIL_NOT_FOUND: "El correo electrónico no fue encontrado",
            INVALID_EMAIL_OR_PASSWORD:
              "El correo electrónico o la contraseña son inválidos",
            USER_ALREADY_EXISTS: "El usuario ya existe",
            USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
              "El usuario ya existe. Usa otro correo electrónico",
            INVALID_PASSWORD: "La contraseña es inválida",
          },
        },
      }),
      tanstackStartCookies(),
    ],
  })
}

export const auth = createAuth()
