import { Button } from "@light/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@light/ui/components/empty"
import { Input } from "@light/ui/components/input"
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
import { useMemo, useState } from "react"

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

  const [search, setSearch] = useState("")
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) {
      return []
    }
    return campaigns?.filter((campaign) =>
      campaign.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [campaigns, search])

  if (isLoading) {
    return <div>Cargando...</div>
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
              {filteredCampaigns.length} campañas activas
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Buscar campañas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-fit"
            />

            {filteredCampaigns.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CompassIcon />
                  </EmptyMedia>
                  <EmptyTitle>No hay campañas activas</EmptyTitle>
                  <EmptyDescription>
                    No se encontraron campañas activas con el término "{search}
                    ".
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul className="flex flex-col gap-2">
                {filteredCampaigns.map((campaign) => (
                  <li key={campaign.id}>
                    <Item variant="outline">
                      <ItemContent>
                        <ItemTitle>
                          {campaign.name} — {campaign.project?.name}
                        </ItemTitle>
                        {campaign.description && (
                          <ItemDescription>
                            {campaign.description}
                          </ItemDescription>
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
            )}
          </div>
        </div>
      </div>
    </>
  )
}
