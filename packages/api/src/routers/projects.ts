import { db } from "@light/db"
import { projects } from "@light/db/schema/projects"
import { z } from "zod/v4"

import { protectedProcedure, router } from ".."
import { newId } from "../lib/uid"

const schema = z.object({
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().optional(),
})

export const projectsRouter = router({
  create: protectedProcedure.input(schema).mutation(async ({ input }) => {
    const project = await db
      .insert(projects)
      .values({
        name: input.name,
        code: newId("project", 16),
        description: input.description,
      })
      .returning()

    return project
  }),
  list: protectedProcedure.query(async () => {
    const response = await db.select().from(projects)
    return response
  }),
  get: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const project = await db.query.projects.findFirst({
        where: {
          code: input.code,
        },
      })
      return project
    }),
})
