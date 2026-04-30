import { db } from "@light/db"
import { campaignApplications, campaigns } from "@light/db/schema/projects"
import { z } from "zod/v4"

import { protectedProcedure, router } from ".."
import { newId } from "../lib/uid"
import {
  addApplicationSchema,
  createCampaignSchema,
} from "../schemas/campaigns"

export const campaignsRouter = router({
  create: protectedProcedure
    .input(createCampaignSchema)
    .mutation(async ({ input }) => {
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

  listApplications: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      const { campaignId } = input

      const dbResponse = await db.query.campaignApplications.findMany({
        where: {
          campaignId,
        },
        with: {
          participant: {
            columns: {
              id: true,
              name: true,
              lastName: true,
              email: true,
            },
          },
        },
      })

      const response = dbResponse.map(({ participant, ...rest }) => ({
        ...rest,
        ...participant,
      }))

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

  getApplication: protectedProcedure
    .input(z.object({ campaignId: z.number(), participantId: z.number() }))
    .query(async ({ input }) => {
      const { campaignId, participantId } = input

      const response = await db.query.campaignApplications.findFirst({
        where: {
          campaignId,
          participantId,
        },
      })

      return response
    }),

  addApplication: protectedProcedure
    .input(addApplicationSchema)
    .mutation(async ({ input }) => {
      const response = await db
        .insert(campaignApplications)
        .values({
          ...input,
          code: newId("cppt", 16),
          amount: input.amount.toString(),
        })
        .returning()

      return response
    }),
})
