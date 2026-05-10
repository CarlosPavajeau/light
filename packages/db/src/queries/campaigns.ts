import { eq } from "drizzle-orm"

import { db } from ".."
import { campaigns } from "../schema"

type UpdateCampaignParams = {
  id: number
  name: string
  description?: string
}

export async function updateCampaign(campaign: UpdateCampaignParams) {
  const { id, ...rest } = campaign

  const [updated] = await db
    .update(campaigns)
    .set(rest)
    .where(eq(campaigns.id, id))
    .returning()

  return updated
}
