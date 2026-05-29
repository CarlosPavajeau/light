import { router } from "../index"
import { campaignsRouter } from "./campaigns"
import { externalRouter } from "./external"
import { participantsRouter } from "./participants"
import { projectsRouter } from "./projects"
import { usersRouter } from "./users"

export const appRouter = router({
  projects: projectsRouter,
  campaigns: campaignsRouter,
  participants: participantsRouter,
  external: externalRouter,
  users: usersRouter,
})
export type AppRouter = typeof appRouter
