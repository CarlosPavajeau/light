import { Button } from "@light/ui/components/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@light/ui/components/dialog"
import { useQuery } from "@tanstack/react-query"
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
  const privateData = useQuery(trpc.privateData.queryOptions())

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session?.user.name}</p>
      <p>API: {privateData.data?.message}</p>

      <Dialog>
        <DialogTrigger render={<Button />}>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
