import { Button } from "@light/ui/components/button"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@light/ui/components/item"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

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

type CampaignParticipantsProps = {
  campaignId: number
}

function CampaignParticipants({ campaignId }: CampaignParticipantsProps) {
  const trpc = useTRPC()
  const { data: participants, isLoading } = useQuery({
    ...trpc.campaigns.listParticipants.queryOptions({ campaignId }),
    enabled: !!campaignId,
  })

  if (isLoading) {
    return <span>Cargando participantes...</span>
  }

  if (!participants?.length) {
    return <span>No hay participantes</span>
  }

  return (
    <ul className="flex flex-col gap-2">
      {participants.map((p) => (
        <Item key={p.id} variant="muted">
          <ItemContent>
            <ItemTitle>
              {p.name} {p.lastName}
            </ItemTitle>
            <ItemDescription>
              N° Voucher: {p.voucher ?? "N/A"}, Número de cuenta:{" "}
              {p.accountNumber ?? "N/A"}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ul>
  )
}
