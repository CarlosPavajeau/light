import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { useTRPC } from "@/utils/trpc"

export const Route = createFileRoute("/_authed/dashboard/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useRouteContext()
  const trpc = useTRPC()

  const { data: projects, isLoading } = useQuery(
    trpc.projects.list.queryOptions()
  )

  return (
    <>
      <h1>Panel de control</h1>
      <p>Bienvenido {session?.user.name}</p>
      {isLoading && <p>Loading...</p>}
      <ul>
        {projects?.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </>
  )
}
