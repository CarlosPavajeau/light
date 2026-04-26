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
      from: r.campaigns.id.through(r.campaignParticipants.campaignId),
      to: r.participants.id.through(r.campaignParticipants.participantId),
    }),
  },
  participants: {
    campaigns: r.many.campaigns({
      from: r.participants.id.through(r.campaignParticipants.participantId),
      to: r.campaigns.id.through(r.campaignParticipants.campaignId),
    }),
  },
}))
