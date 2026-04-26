export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b border-border bg-background/75 backdrop-blur-xl">
      <nav
        aria-label="Navegacion principal"
        className="flex w-full items-center justify-between px-4 sm:px-6"
      >
        <span>Bienvenido</span>
      </nav>
    </header>
  )
}
