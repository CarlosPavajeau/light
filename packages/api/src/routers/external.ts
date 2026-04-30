import { env } from "@light/env/server"
import { z } from "zod/v4"

import { protectedProcedure, router } from ".."
import { newId } from "../lib/uid"

export type PresignDownloadResult = {
  url: string
}

export type PresignUploadResult = {
  url: string
  key: string
}

export const externalRouter = router({
  presignUpload: protectedProcedure.mutation(async () => {
    const key = newId("attachment", 16)

    const response = await fetch(`${env.EXTERNAL_API_URL}/presign/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": env.API_KEY,
      },
      body: JSON.stringify({ key }),
    })

    if (!response.ok) {
      throw new Error("Failed to presign upload")
    }

    const { url } = (await response.json()) as { url: string }

    return { url, key } as PresignUploadResult
  }),

  presignDownload: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(
          `${env.EXTERNAL_API_URL}/presign/download`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": env.API_KEY,
            },
            body: JSON.stringify({ key: input }),
          }
        )
        if (!response.ok) {
          throw new Error("Failed to presign download")
        }
        return (await response.json()) as PresignDownloadResult
      } catch (error) {
        throw new Error("Failed to presign download", { cause: error })
      }
    }),
})
