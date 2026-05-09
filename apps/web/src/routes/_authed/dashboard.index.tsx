import { Button } from "@light/ui/components/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@light/ui/components/card"
import { Input } from "@light/ui/components/input"
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
        Bienvenido {session.user.name}
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
              <Card>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  {project.description && (
                    <CardDescription>{project.description}</CardDescription>
                  )}
                </CardHeader>

                <CardFooter className="gap-2">
                  <Button
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

                  <Button variant="outline">Editar</Button>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
