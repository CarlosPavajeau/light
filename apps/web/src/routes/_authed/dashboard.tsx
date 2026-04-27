import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import Header from "@/components/header"

export const Route = createFileRoute("/_authed/dashboard")({
  beforeLoad: ({ context }) => {
    const { user } = context.session

    if (user.role !== "admin") {
      throw redirect({
        to: "/campaigns",
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Header />
      <div className="px-4 pt-8 pb-16 sm:px-6">
        <Outlet />
      </div>
    </>
  )
}
