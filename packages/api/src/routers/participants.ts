import { db } from "@light/db"
import { updateParticipant } from "@light/db/queries/participants"
import { participants } from "@light/db/schema/projects"
import { TRPCError } from "@trpc/server"
import { z } from "zod/v4"

import { protectedProcedure, router } from ".."
import { newId } from "../lib/uid"
import {
  createParticipantSchema,
  updateParticipantSchema,
} from "../schemas/participant"

export const participantsRouter = router({
  create: protectedProcedure
    .input(createParticipantSchema)
    .mutation(async ({ input }) => {
      const participant = await db
        .insert(participants)
        .values({
          ...input,
          code: newId("participant", 8),
        })
        .returning()

      return participant
    }),

  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const participant = await db.query.participants.findFirst({
      where: {
        userId,
      },
    })

    return participant
  }),

  getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
    const participant = await db.query.participants.findFirst({
      where: {
        id: input,
      },
    })

    return participant
  }),

  update: protectedProcedure
    .input(updateParticipantSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" })
      }
      return updateParticipant(input)
    }),
})
