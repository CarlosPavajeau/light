import { Button } from "@light/ui/components/button"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import Header from "@/components/header"
import { ParticipantRegistrationForm } from "@/components/participants/registration-form"
import { useTRPC } from "@/utils/trpc"

export const Route = createFileRoute("/_authed/campaigns/$code/apply")({
  component: RouteComponent,
})

function RouteComponent() {
  const { code } = Route.useParams()
  const trpc = useTRPC()
  const { data: campaign, isLoading } = useQuery(
    trpc.campaigns.get.queryOptions({ code })
  )
  const { data: participant, isLoading: isParticipantLoading } = useQuery(
    trpc.participants.get.queryOptions()
  )

  if (isLoading || isParticipantLoading) {
    return <div>Cargando...</div>
  }

  if (!campaign) {
    return <div>Campaña no encontrada</div>
  }

  if (!campaign.isActive) {
    return <div>Campaña no activa</div>
  }

  return (
    <>
      <Header />

      <div className="px-4 pt-8 pb-16 sm:px-6">
        <div className="space-y-10 sm:space-y-12">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {campaign.name}
            </h1>
            {participant && (
              <h2 className="text-lg tracking-tight">
                Bienvenido, {participant.name} {participant.lastName}
              </h2>
            )}
          </div>

          <div>
            {participant ? (
              <Button>En construcción</Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight">
                    Registro de participante
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Completa tu información para aplicar a esta campaña.
                  </p>
                </div>
                <ParticipantRegistrationForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
