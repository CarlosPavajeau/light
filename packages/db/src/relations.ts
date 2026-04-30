import { defineRelations } from "drizzle-orm"

import * as schema from "./schema"

export const relations = defineRelations(schema, (r) => ({
  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id,
    }),
  },
  users: {
    accounts: r.many.accounts(),
    sessions: r.many.sessions(),
    participant: r.one.participants({
      from: r.users.id,
      to: r.participants.userId,
    }),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },
  projects: {
    campaings: r.many.campaigns(),
  },
  campaigns: {
    project: r.one.projects({
      from: r.campaigns.projectId,
      to: r.projects.id,
    }),
    participants: r.many.participants({
      from: r.campaigns.id.through(r.campaignApplications.campaignId),
      to: r.participants.id.through(r.campaignApplications.participantId),
    }),
  },
  participants: {
    campaigns: r.many.campaigns({
      from: r.participants.id.through(r.campaignApplications.participantId),
      to: r.campaigns.id.through(r.campaignApplications.campaignId),
    }),
    user: r.one.users({
      from: r.participants.userId,
      to: r.users.id,
    }),
  },
  campaignApplications: {
    campaign: r.one.campaigns({
      from: r.campaignApplications.campaignId,
      to: r.campaigns.id,
    }),
    participant: r.one.participants({
      from: r.campaignApplications.participantId,
      to: r.participants.id,
    }),
  },
}))
