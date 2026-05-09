import { db } from "@light/db"
import { updateProject } from "@light/db/queries/projects"
import { projects } from "@light/db/schema/projects"
import { z } from "zod/v4"

import { protectedProcedure, router } from ".."
import { newId } from "../lib/uid"
import { createProjectSchema, updateProjectSchema } from "../schemas/projects"

export const projectsRouter = router({
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ input }) => {
      const [project] = await db
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

  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ input }) => {
      const response = await updateProject(input)

      return response
    }),
})
