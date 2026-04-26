import { Button } from "@light/ui/components/button"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"

import { getUser } from "@/functions/get-user"
import { useTRPC } from "@/utils/trpc"

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser()
    return { session }
  },
  loader: ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

function RouteComponent() {
  const { session } = Route.useRouteContext()

  const trpc = useTRPC()

  const { mutate } = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: () => {
        console.log("Project created")
      },
    })
  )

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session?.user.name}</p>
      <Button onClick={() => mutate({ name: "Prueba" })}>Create Project</Button>
    </div>
  )
}
