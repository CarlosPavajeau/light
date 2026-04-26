import { db } from "@light/db"
import { campaigns } from "@light/db/schema/projects"
import { z } from "zod/v4"

import { protectedProcedure, router } from ".."
import { newId } from "../lib/uid"

const schema = z.object({
  name: z.string(),
  description: z.string().optional(),
  projectId: z.number(),
})

export const campaignsRouter = router({
  create: protectedProcedure.input(schema).mutation(async ({ input }) => {
    const { name, description, projectId } = input

    const campaign = await db
      .insert(campaigns)
      .values({
        code: newId("campaign", 16),
        name,
        description,
        projectId,
      })
      .returning()

    return campaign
  }),
  listByProject: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const { projectId } = input

      const response = await db.query.campaigns.findMany({
        where: {
          projectId,
        },
      })

      return response
    }),
  get: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const { code } = input

      const response = await db.query.campaigns.findFirst({
        where: {
          code,
        },
      })

      return response
    }),
})
