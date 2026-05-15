import { eq } from "drizzle-orm"

import { db } from ".."
import { participants } from "../schema/projects"

type UpdateParticipant = Omit<
  typeof participants.$inferInsert,
  "code" | "userId" | "createdAt" | "updatedAt"
> & { id: number }

export async function updateParticipant(participant: UpdateParticipant) {
  const { id, ...rest } = participant

  const [updated] = await db
    .update(participants)
    .set(rest)
    .where(eq(participants.id, id))
    .returning()

  return updated
}
