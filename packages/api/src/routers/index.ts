import { router } from "../index"
import { campaignsRouter } from "./campaigns"
import { participantsRouter } from "./participants"
import { projectsRouter } from "./projects"

export const appRouter = router({
  projects: projectsRouter,
  campaigns: campaignsRouter,
  participants: participantsRouter,
})
export type AppRouter = typeof appRouter
