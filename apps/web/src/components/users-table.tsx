import { Badge } from "@light/ui/components/badge"
import { Button } from "@light/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@light/ui/components/dropdown-menu"
import { Input } from "@light/ui/components/input"
import type { PaginationState } from "@tanstack/react-table"
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontalIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { TablePagination } from "./data-table/pagination"
import { DataTable } from "./data-table/table"
import { ResetPasswordDialog } from "./users/reset-password-dialog"
import { UpdateUserDialog } from "./users/update-user-dialog"

export type UsersTableUser = {
  banned: boolean | null
  email: string
  id: string
  name: string
  role?: string | null
}

const columnHelper = createColumnHelper<UsersTableUser>()

const columns = [
  columnHelper.display({
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <p className="truncate leading-none font-medium uppercase">
            {row.original.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {row.original.email}
          </p>
        </div>
      </div>
    ),
    header: "Usuario",
    id: "user",
  }),
  columnHelper.accessor("role", {
    cell: ({ getValue }) => {
      const role = getValue() ?? "user"
      return (
        <Badge variant={role === "admin" ? "default" : "secondary"}>
          {role === "admin" ? "Administrador" : "Usuario"}
        </Badge>
      )
    },
    header: "Rol",
  }),
  columnHelper.accessor("banned", {
    cell: ({ getValue }) =>
      getValue() === true ? (
        <Badge variant="destructive">Baneado</Badge>
      ) : (
        <Badge variant="outline">Activo</Badge>
      ),
    header: "Estado",
  }),
  columnHelper.display({
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <RowActions user={row.original} />,
  }),
]

type Props = {
  isLoading?: boolean
  onPaginationChange: (page: number, pageSize: number) => void
  onSearchChange: (search: string) => void
  page: number
  pageSize: number
  search: string
  totalPages: number
  users: UsersTableUser[]
}

export function UsersTable({
  isLoading = false,
  onPaginationChange,
  onSearchChange,
  page,
  pageSize,
  search,
  totalPages,
  users,
}: Props) {
  const [searchValue, setSearchValue] = useState(search)
  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: page - 1,
      pageSize,
    }),
    [page, pageSize]
  )

  useEffect(() => {
    setSearchValue(search)
  }, [search])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchValue !== search) {
        onSearchChange(searchValue)
      }
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [onSearchChange, search, searchValue])

  const table = useReactTable({
    columns,
    data: users,
    manualPagination: true,
    pageCount: totalPages,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (updater) => {
      const nextPagination =
        typeof updater === "function" ? updater(pagination) : updater
      onPaginationChange(nextPagination.pageIndex + 1, nextPagination.pageSize)
    },
    state: {
      pagination,
    },
  })

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <Input
          id="search-users"
          value={searchValue}
          placeholder="Buscar usuarios..."
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      <DataTable
        table={table}
        isLoading={isLoading}
        loadingLabel="Cargando usuarios..."
      />
      <TablePagination table={table} />
    </div>
  )
}

function RowActions({ user }: { user: UsersTableUser }) {
  const [openReset, setOpenReset] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label="Abrir acciones"
              size="sm"
              variant="ghost"
              className="size-8 p-0"
            >
              <MoreHorizontalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem onClick={() => setOpenUpdate(true)}>
            Actualizar datos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenReset(true)}>
            Reestablecer contraseña
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateUserDialog
        user={user}
        open={openUpdate}
        onOpenChange={setOpenUpdate}
      />
      <ResetPasswordDialog
        user={user}
        open={openReset}
        onOpenChange={setOpenReset}
      />
    </>
  )
}
