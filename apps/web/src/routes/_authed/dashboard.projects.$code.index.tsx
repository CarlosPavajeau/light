import { Button } from "@light/ui/components/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@light/ui/components/item"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

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

  const { data: campaigns } = useQuery({
    ...trpc.campaigns.listByProject.queryOptions({
      projectId: project?.id ?? 0,
    }),
    enabled: !!project?.id,
  })

  if (isLoading) {
    return <span>Cargando...</span>
  }

  if (!project) {
    return <span>Proyecto no encontrado</span>
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="w-fit"
          render={<Link to="/dashboard" />}
          nativeButton={false}
        >
          Regresar
        </Button>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Projecto {project.name}
        </h1>

        <span className="text-sm text-muted-foreground">
          {project.description}
        </span>
      </div>

      <div className="flex flex-wrap justify-between gap-2">
        <h2 className="text-sm font-medium">Campañas</h2>
        <CreateCampaignDialog projectId={project.id} />
      </div>

      <ul className="flex flex-col gap-2">
        {campaigns?.map((campaign) => (
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
                        code: project.code,
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
