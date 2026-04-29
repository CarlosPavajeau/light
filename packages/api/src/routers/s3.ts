import { createDownloadPresignedUrl, createUploadPresignedUrl } from "@light/s3"
import z from "zod/v4"

import { protectedProcedure, router } from ".."
import { newId } from "../lib/uid"

export const s3Router = router({
  createUploadPresignedUrl: protectedProcedure.mutation(async () => {
    const key = newId("attachment", 16)
    const bucket = "light-campaign-attachments"

    const url = await createUploadPresignedUrl({ key, bucket })

    return { url, key }
  }),

  createDownloadPresignedUrl: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const key = input.code
      const bucket = "light-campaign-attachments"

      const result = await createDownloadPresignedUrl({
        key,
        bucket,
      })

      return result
    }),
})
