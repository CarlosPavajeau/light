import { Button } from "@light/ui/components/button"
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
import { useMemo, useState } from "react"

import { CreateCampaignDialog } from "@/components/campaigns/create-dialog"
import { useTRPC } from "@/utils/trpc"

export const Route = createFileRoute("/_authed/dashboard/projects/$code/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { code } = Route.useParams()
  const trpc = useTRPC()
  const { data: project, isLoading } = useQuery(
    trpc.projects.get.queryOptions({
      code,
    })
  )

  if (isLoading) {
    return <span>Cargando...</span>
  }

  if (!project) {
    return <span>Proyecto no encontrado</span>
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="w-fit"
          render={<Link to="/dashboard" />}
          nativeButton={false}
        >
          Volver
        </Button>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Projecto {project.name}
        </h1>

        <span className="text-sm text-muted-foreground">
          {project.description}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-medium">Campañas</h2>
          <CreateCampaignDialog projectId={project.id} />

          <CampaignsList projectId={project.id} />
        </div>
      </div>
    </div>
  )
}

type CampaignsListProps = {
  projectId: number
}

function CampaignsList({ projectId }: CampaignsListProps) {
  const trpc = useTRPC()
  const { code } = Route.useParams()
  const { data: campaigns, isLoading } = useQuery({
    ...trpc.campaigns.listByProject.queryOptions({
      projectId,
    }),
  })

  const [search, setSearch] = useState("")

  const filteredCampaigns = useMemo(() => {
    if (!campaigns) {
      return []
    }

    return campaigns.filter((campaign) =>
      campaign.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [campaigns, search])

  if (isLoading) {
    return <span>Cargando campañas...</span>
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <span className="text-muted-foreground">No hay campañas registradas</span>
    )
  }

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Buscar campañas..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-fit"
      />
      <ul className="flex flex-col gap-2">
        {filteredCampaigns.map((campaign) => (
          <li key={campaign.id}>
            <Item variant="outline">
              <ItemContent>
                <ItemTitle>{campaign.name}</ItemTitle>
                {campaign.description && (
                  <ItemDescription>{campaign.description}</ItemDescription>
                )}
              </ItemContent>
              <ItemActions>
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link
                      to="/dashboard/projects/$code/c/$campaignCode"
                      params={{
                        code,
                        campaignCode: campaign.code,
                      }}
                    />
                  }
                  nativeButton={false}
                >
                  Ver detalles
                </Button>
              </ItemActions>
            </Item>
          </li>
        ))}
      </ul>
    </div>
  )
}
