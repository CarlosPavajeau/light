import { Button } from "@light/ui/components/button"
import { Link } from "@tanstack/react-router"

import { authClient } from "@/lib/auth-client"

export default function Header() {
  const { data } = authClient.useSession()

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b border-border bg-background/75 backdrop-blur-xl">
      <nav
        aria-label="Navegacion principal"
        className="flex w-full items-center justify-between px-4 sm:px-6"
      >
        <span>Bienvenido</span>

        {data && data.user.role === "admin" && (
          <Button render={<Link to="/dashboard" />} nativeButton={false}>
            Panel de control
          </Button>
        )}
      </nav>
    </header>
  )
}
