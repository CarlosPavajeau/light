import { Button } from "@light/ui/components/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@light/ui/components/item"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

import { CreateProjectDialog } from "@/components/projects/create-dialog"
import { useTRPC } from "@/utils/trpc"

export const Route = createFileRoute("/_authed/dashboard/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useRouteContext()
  const trpc = useTRPC()

  const { data: projects } = useQuery(trpc.projects.list.queryOptions())

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Bienvenido {session?.user.name}
      </h1>

      <div className="flex flex-col gap-2">
        <CreateProjectDialog />
        <ul className="flex flex-col gap-2">
          {projects?.map((project) => (
            <li key={project.id}>
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle>{project.name}</ItemTitle>
                  <ItemDescription>{project.description}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <Link
                        to="/dashboard/projects/$code"
                        params={{ code: project.code }}
                      />
                    }
                    nativeButton={false}
                  >
                    Ver detalles
                  </Button>
                </ItemActions>
              </Item>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
