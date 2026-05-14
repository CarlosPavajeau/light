import { and, eq } from "drizzle-orm"

import { db } from ".."
import { campaignApplications, campaigns } from "../schema"

type UpdateCampaignParams = {
  id: number
  name: string
  description?: string
  isActive: boolean
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

export async function updateApplicationStatus(
  campaignId: number,
  participantId: number,
  status: string
) {
  const [updated] = await db
    .update(campaignApplications)
    .set({ status })
    .where(
      and(
        eq(campaignApplications.campaignId, campaignId),
        eq(campaignApplications.participantId, participantId)
      )
    )
    .returning()

  return updated
}

export async function deleteApplication(
  campaignId: number,
  participantId: number
) {
  await db
    .delete(campaignApplications)
    .where(
      and(
        eq(campaignApplications.campaignId, campaignId),
        eq(campaignApplications.participantId, participantId)
      )
    )
}
