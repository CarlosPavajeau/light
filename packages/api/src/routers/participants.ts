import { db } from "@light/db"
import { participants } from "@light/db/schema/projects"
import { z } from "zod/v4"

import { protectedProcedure, router } from ".."
import { newId } from "../lib/uid"

const schema = z.object({
  name: z.string(),
  lastName: z.string(),
  documentType: z.enum(["CC", "CE", "PT"]),
  documentNumber: z.string(),
  documentIssueDate: z.string(),
  documentExpirationDate: z.string().optional(),
  documentIssuePlace: z.string(),
  birthDate: z.string(),
  birthPlace: z.string(),
  email: z.string(),
  telegramUsername: z.string().optional(),
  phone: z.string().optional(),
  residenceCountry: z.string(),
  residenceState: z.string(),
  residenceCity: z.string(),
  address: z.string(),
  postalCode: z.string().optional(),
})

export const participantsRouter = router({
  create: protectedProcedure.input(schema).mutation(async ({ input }) => {
    const participant = await db
      .insert(participants)
      .values({
        ...input,
        code: newId("participant", 8),
      })
      .returning()

    return participant
  }),
})
