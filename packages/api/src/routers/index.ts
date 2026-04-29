import { router } from "../index"
import { campaignsRouter } from "./campaigns"
import { participantsRouter } from "./participants"
import { projectsRouter } from "./projects"
import { s3Router } from "./s3"

export const appRouter = router({
  projects: projectsRouter,
  campaigns: campaignsRouter,
  participants: participantsRouter,
  s3: s3Router,
})
export type AppRouter = typeof appRouter
