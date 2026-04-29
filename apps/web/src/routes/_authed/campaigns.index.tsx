import { Button } from "@light/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@light/ui/components/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@light/ui/components/item"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { CompassIcon } from "lucide-react"

import Header from "@/components/header"
import { useTRPC } from "@/utils/trpc"

export const Route = createFileRoute("/_authed/campaigns/")({
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const { data: campaigns, isLoading } = useQuery(
    trpc.campaigns.listActive.queryOptions()
  )

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (!campaigns) {
    return <div>No se encontraron campañas</div>
  }

  if (campaigns.length === 0) {
    return (
      <>
        <Header />
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CompassIcon />
            </EmptyMedia>
            <EmptyTitle>No hay campañas activas</EmptyTitle>
            <EmptyDescription>
              No hay campañas activas en este momento.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="px-4 pt-8 pb-16 sm:px-6">
        <div className="space-y-10 sm:space-y-12">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Campañas activas
            </h1>

            <p className="text-sm text-muted-foreground">
              {campaigns?.length} campañas activas
            </p>
          </div>

          <ul className="flex flex-col gap-2">
            {campaigns?.map((campaign) => (
              <li key={campaign.id}>
                <Item variant="outline">
                  <ItemContent>
                    <ItemTitle>
                      {campaign.name} — {campaign.project?.name}
                    </ItemTitle>
                    {campaign.description && (
                      <ItemDescription>{campaign.description}</ItemDescription>
                    )}
                  </ItemContent>
                  <ItemActions>
                    <Button
                      render={
                        <Link
                          to="/campaigns/$code/apply"
                          params={{ code: campaign.code }}
                        />
                      }
                      nativeButton={false}
                    >
                      Aplicar
                    </Button>
                  </ItemActions>
                </Item>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
