import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@light/ui/components/empty"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { UserIcon } from "lucide-react"
import { useCallback } from "react"
import { z } from "zod/v4"

import { UsersTable } from "@/components/users-table"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { useTRPC } from "@/utils/trpc"

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

const usersSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional(),
})

export const Route = createFileRoute("/_authed/dashboard/users/")({
  validateSearch: (search) => {
    const result = usersSearchSchema.safeParse(search)

    if (!result.success) {
      return {}
    }

    return result.data
  },
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const navigate = useNavigate({ from: Route.fullPath })
  const searchParams = Route.useSearch()
  const page = searchParams.page ?? DEFAULT_PAGE
  const pageSize = searchParams.pageSize ?? DEFAULT_PAGE_SIZE
  const search = searchParams.search ?? ""

  const { data, isFetching, isLoading } = useQuery({
    ...trpc.users.list.queryOptions({
      page,
      pageSize,
      search,
    }),
    placeholderData: keepPreviousData,
  })

  const updateSearchParams = useCallback(
    (nextSearch: string) => {
      navigate({
        search: (previous) => ({
          ...previous,
          page: DEFAULT_PAGE,
          search: nextSearch.trim() || undefined,
        }),
      })
    },
    [navigate]
  )

  const updatePagination = useCallback(
    (nextPage: number, nextPageSize: number) => {
      navigate({
        search: (previous) => ({
          ...previous,
          page: nextPage,
          pageSize: nextPageSize,
        }),
      })
    },
    [navigate]
  )

  if (!isLoading && (!data || (data.total === 0 && search.length === 0))) {
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

  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 0
  const users = data?.users ?? []

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "usuario" : "usuarios"} en total
          </p>
        </div>

        <CreateUserDialog />
      </div>

      <UsersTable
        isLoading={isFetching}
        onPaginationChange={updatePagination}
        onSearchChange={updateSearchParams}
        page={page}
        pageSize={pageSize}
        search={search}
        totalPages={totalPages}
        users={users}
      />
    </div>
  )
}
