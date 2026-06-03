import { Button } from "@light/ui/components/button"
import { Link } from "@tanstack/react-router"

import { authClient } from "@/lib/auth-client"

import { SignOutButton } from "./sign-out-button"

export default function Header() {
  const { data } = authClient.useSession()

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b border-border bg-background/75 backdrop-blur-xl">
      <nav
        aria-label="Navegacion principal"
        className="flex w-full min-w-0 items-center justify-between gap-3 px-3 sm:px-6"
      >
        <Link
          aria-label="Ir al inicio"
          className="flex min-w-0 shrink-0 items-center gap-2 font-semibold"
          to="/"
        >
          <img
            alt="LUMEN888"
            className="h-10 w-10 shrink-0 rounded-full object-contain sm:h-11 sm:w-11"
            height={40}
            src="/logo.png"
            width={40}
          />
          <span className="hidden sm:inline">LUMEN888</span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {data && data.user.role === "admin" && (
            <Button
              className="min-w-0 px-3 sm:px-4"
              nativeButton={false}
              render={<Link to="/dashboard" />}
            >
              <span className="sm:hidden">Panel</span>
              <span className="hidden sm:inline">Panel de control</span>
            </Button>
          )}

          <SignOutButton />
        </div>
      </nav>
    </header>
  )
}
