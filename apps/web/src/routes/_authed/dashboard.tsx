import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@light/ui/components/sidebar"
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router"
import { FolderIcon, UserIcon } from "lucide-react"

export const Route = createFileRoute("/_authed/dashboard")({
  ssr: false,
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
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b border-border bg-background/75 backdrop-blur-xl">
          <nav
            aria-label="Navegacion principal"
            className="flex w-full items-center justify-between px-4 sm:px-6"
          >
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="font-medium">LUMEN888</span>
            </div>
          </nav>
        </header>

        <div className="px-4 pt-8 pb-16 sm:px-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AppSidebar() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  })

  const { isMobile, openMobile, setOpenMobile } = useSidebar()

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile)
    } else {
      setOpenMobile(false)
      setOpenMobile(!openMobile)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link to="/dashboard" />}
                  isActive={pathname === "/dashboard"}
                  tooltip="Proyectos"
                  onClick={toggleSidebar}
                >
                  <FolderIcon />
                  Proyectos
                </SidebarMenuButton>
                <SidebarMenuButton
                  render={<Link to="/dashboard/users" />}
                  isActive={pathname === "/dashboard/users"}
                  tooltip="Usuarios"
                  onClick={toggleSidebar}
                >
                  <UserIcon />
                  Usuarios
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
