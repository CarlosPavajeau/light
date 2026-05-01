import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@light/ui/components/empty"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { UserIcon } from "lucide-react"

import { UsersTable } from "@/components/users-table"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/_authed/dashboard/users/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["users", "list"],
    queryFn: () =>
      authClient.admin.listUsers({
        query: {},
      }),
  })

  if (isLoading) {
    return <span>Cargando...</span>
  }

  if (!data || !data.data || data.data.total === 0) {
    return (
      <Empty className="border py-20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserIcon />
          </EmptyMedia>
          <EmptyTitle>Sin usuarios</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            No hay usuarios registrados en la plataforma.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    )
  }

  const { total, users } = data.data

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "usuario" : "usuarios"} en total
        </p>
      </div>

      <UsersTable users={users} />
    </div>
  )
}
