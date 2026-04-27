import { db } from "@light/db"
import { campaignParticipants, campaigns } from "@light/db/schema/projects"
import { z } from "zod/v4"

import { protectedProcedure, router } from ".."
import { newId } from "../lib/uid"

const schema = z.object({
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
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

  listActive: protectedProcedure.query(async () => {
    const response = await db.query.campaigns.findMany({
      where: {
        isActive: true,
      },
      with: {
        project: {
          columns: {
            name: true,
          },
        },
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
        with: {
          participants: {
            columns: {
              id: true,
              name: true,
              lastName: true,
              email: true,
            },
          },
        },
      })

      return response
    }),

  getParticipant: protectedProcedure
    .input(z.object({ campaignId: z.number(), participantId: z.number() }))
    .query(async ({ input }) => {
      const { campaignId, participantId } = input

      const response = await db.query.campaignParticipants.findFirst({
        where: {
          campaignId,
          participantId,
        },
      })

      return response
    }),

  addParticipant: protectedProcedure
    .input(z.object({ campaignId: z.number(), participantId: z.number() }))
    .mutation(async ({ input }) => {
      const { campaignId, participantId } = input

      const response = await db
        .insert(campaignParticipants)
        .values({
          campaignId,
          participantId,
          code: newId("cppt"),
        })
        .returning()

      return response
    }),
})
