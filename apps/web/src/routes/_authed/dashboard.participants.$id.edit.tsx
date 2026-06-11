import { Button } from "@light/ui/components/button"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { ParticipantEditForm } from "@/components/participants/edit-form"
import { useTRPC } from "@/utils/trpc"

export const Route = createFileRoute(
  "/_authed/dashboard/participants/$id/edit"
)({
  component: EditParticipantPage,
})

const handleBack = () => {
  window.history.back()
}

function EditParticipantPage() {
  const { id } = Route.useParams()
  const trpc = useTRPC()

  const { data: participant, isLoading } = useQuery(
    trpc.participants.getById.queryOptions(Number(id))
  )

  if (isLoading) {
    return <span>Cargando...</span>
  }

  if (!participant) {
    return <span>Participante no encontrado</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="w-fit"
          onClick={handleBack}
        >
          Volver
        </Button>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Editar participante
        </h1>
        <span className="text-sm text-muted-foreground">
          {participant.name} {participant.lastName}
        </span>
      </div>

      <ParticipantEditForm participant={participant} onSuccess={handleBack} />
    </div>
  )
}
