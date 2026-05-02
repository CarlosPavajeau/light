import { Button } from "@light/ui/components/button"
import { Input } from "@light/ui/components/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@light/ui/components/item"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { CreateProjectDialog } from "@/components/projects/create-dialog"
import { useTRPC } from "@/utils/trpc"

export const Route = createFileRoute("/_authed/dashboard/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useRouteContext()
  const trpc = useTRPC()
  const [search, setSearch] = useState("")

  const { data: projects } = useQuery(trpc.projects.list.queryOptions())

  const filteredProjects = useMemo(
    () =>
      projects?.filter((project) =>
        project.name.toLowerCase().includes(search.toLowerCase())
      ),
    [projects, search]
  )

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Bienvenido {session?.user.name}
      </h1>

      <div className="flex flex-col gap-4">
        <CreateProjectDialog />
        <Input
          type="text"
          placeholder="Buscar proyectos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-fit"
        />
        <ul className="flex flex-col gap-2">
          {filteredProjects?.map((project) => (
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
