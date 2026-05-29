import { db } from "@light/db"
import { users } from "@light/db/schema/auth"
import { TRPCError } from "@trpc/server"
import { sql } from "drizzle-orm"
import { z } from "zod/v4"

import { protectedProcedure, router } from ".."

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

const listUsersSchema = z.object({
  page: z.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  search: z.string().trim().max(100).default(""),
})

const escapeLikePattern = (value: string) =>
  value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_")

export const usersRouter = router({
  list: protectedProcedure
    .input(listUsersSchema)
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      const search = input.search.trim().toLowerCase()
      const offset = (input.page - 1) * input.pageSize
      const searchPattern = `%${escapeLikePattern(search)}%`
      const startsWithSearchPattern = `${escapeLikePattern(search)}%`

      const whereClause =
        search.length > 0
          ? sql`(
            lower(${users.name}) like ${searchPattern} escape '\'
            or lower(${users.email}) like ${searchPattern} escape '\'
          )`
          : undefined

      const orderByClause =
        search.length > 0
          ? sql`
            case
              when lower(${users.email}) = ${search} then 0
              when lower(${users.name}) = ${search} then 1
              when lower(${users.email}) like ${startsWithSearchPattern} escape '\' then 2
              when lower(${users.name}) like ${startsWithSearchPattern} escape '\' then 3
              else 4
            end,
            lower(${users.name}) asc,
            lower(${users.email}) asc
          `
          : sql`${users.createdAt} desc`

      const [rows, totalRows] = await Promise.all([
        db
          .select()
          .from(users)
          .where(whereClause)
          .orderBy(orderByClause)
          .limit(input.pageSize)
          .offset(offset),
        db
          .select({ total: sql<number>`count(*)::int` })
          .from(users)
          .where(whereClause),
      ])

      const total = totalRows[0]?.total ?? 0

      return {
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages: Math.ceil(total / input.pageSize),
        users: rows.map((user) => ({
          ...user,
          role: user.role ?? undefined,
        })),
      }
    }),
})
