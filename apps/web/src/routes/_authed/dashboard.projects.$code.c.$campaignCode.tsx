import type { AppRouter } from "@light/api/routers/index"
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
import type { inferRouterOutputs } from "@trpc/server"
import { useState } from "react"

import { ApplicationDetailsModal } from "@/components/campaigns/application-details-modal"
import { useTRPC } from "@/utils/trpc"

export const Route = createFileRoute(
  "/_authed/dashboard/projects/$code/c/$campaignCode"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { campaignCode, code } = Route.useParams()
  const trpc = useTRPC()
  const { data: campaign, isLoading } = useQuery(
    trpc.campaigns.get.queryOptions({ code: campaignCode })
  )

  if (isLoading) {
    return <span>Cargando...</span>
  }

  if (!campaign) {
    return <span>Campaña no encontrada</span>
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="w-fit"
          render={<Link to="/dashboard/projects/$code" params={{ code }} />}
          nativeButton={false}
        >
          Volver
        </Button>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Campaña {campaign.name}
        </h1>

        <span className="text-sm text-muted-foreground">
          {campaign.description}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-medium">Participantes</h2>
        <CampaignParticipants campaignId={campaign.id} />
      </div>
    </div>
  )
}

type Application =
  inferRouterOutputs<AppRouter>["campaigns"]["listApplications"][number]

type CampaignParticipantsProps = {
  campaignId: number
}

function CampaignParticipants({ campaignId }: CampaignParticipantsProps) {
  const trpc = useTRPC()
  const { data: applications, isLoading } = useQuery({
    ...trpc.campaigns.listApplications.queryOptions({ campaignId }),
    enabled: !!campaignId,
  })
  const [applicationDetailsOpen, setApplicationDetailsOpen] = useState(false)
  const [currentApplication, setCurrentApplication] = useState<
    Application | undefined
  >()
  const [search, setSearch] = useState("")

  const handleApplicationViewDetailsClick = (application: Application) => {
    setCurrentApplication(application)
    setApplicationDetailsOpen(true)
  }

  const filteredApplications = applications?.filter((application) => {
    const query = search.toLocaleLowerCase()
    const fullName =
      `${application.name} ${application.lastName}`.toLocaleLowerCase()
    return fullName.includes(query)
  })

  if (isLoading) {
    return <span>Cargando participantes...</span>
  }

  if (!applications?.length) {
    return <span>No hay participantes</span>
  }

  return (
    <>
      <ApplicationDetailsModal
        application={currentApplication}
        open={applicationDetailsOpen}
        onOpenChange={setApplicationDetailsOpen}
      />
      <Input
        placeholder="Buscar por nombre o apellido..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      {filteredApplications?.length === 0 && (
        <span className="text-sm text-muted-foreground">
          No se encontraron participantes
        </span>
      )}
      <ul className="flex flex-col gap-2">
        {filteredApplications?.map((application) => (
          <Item key={application.id} variant="muted">
            <ItemContent>
              <ItemTitle>
                {application.name} {application.lastName}
              </ItemTitle>
              <ItemDescription>
                N° Voucher: {application.voucher ?? "N/A"}, Número de cuenta:{" "}
                {application.accountNumber ?? "N/A"}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                onClick={() => handleApplicationViewDetailsClick(application)}
              >
                Ver detalles
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ul>
    </>
  )
}
