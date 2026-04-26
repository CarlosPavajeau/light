import {
  boolean,
  date,
  index,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core"

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("projects_code_unique_idx").on(table.code)]
)

export const campaigns = pgTable(
  "campaigns",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    projectId: serial("project_id")
      .notNull()
      .references(() => projects.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("campaigns_code_unique_idx").on(table.code),
    index("campaigns_project_id_idx").on(table.projectId),
  ]
)

export const participants = pgTable(
  "participants",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    lastName: text("last_name").notNull(),
    documentType: text("document_type").notNull(),
    documentNumber: text("document_number").notNull(),
    documentIssueDate: date("document_issue_date").notNull(),
    documentExpirationDate: date("document_expiration_date"),
    documentIssuePlace: text("document_issue_place").notNull(),
    birthDate: date("birth_date").notNull(),
    birthPlace: text("birth_place").notNull(),
    email: text().notNull(),
    telegramUsername: text("telegram_username"),
    phone: text("phone"),
    residenceCountry: text("residence_country"),
    residenceState: text("residence_state"),
    residenceCity: text("residence_city"),
    address: text("address"),
    postalCode: text("postal_code"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("participants_code_unique_idx").on(table.code)]
)

export const campaignParticipants = pgTable(
  "campaign_participants",
  {
    code: text("code").notNull().unique(),
    voucher: text("voucher"),
    accountNumber: text("account_number"),
    attachedFile: text("attached_file"),
    campaignId: serial("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    participantId: serial("participant_id")
      .notNull()
      .references(() => participants.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("campaign_participants_code_unique_idx").on(table.code),
    primaryKey({
      columns: [table.campaignId, table.participantId],
      name: "campaign_participants_pkey",
    }),
  ]
)
