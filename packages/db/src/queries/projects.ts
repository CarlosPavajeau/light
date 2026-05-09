import { eq } from "drizzle-orm"

import { db } from ".."
import { projects } from "../schema"

type UpdateProject = {
  id: number
  name: string
  description?: string
}

export async function updateProject(project: UpdateProject) {
  const { id, ...rest } = project

  const [updated] = await db
    .update(projects)
    .set(rest)
    .where(eq(projects.id, id))
    .returning()

  return updated
}
