import { Button } from "@light/ui/components/button"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useTRPC } from "@/utils/trpc"

type Props = {
  campaignId: number
  participantId: number
}

export function CampaignApplicationForm({ campaignId, participantId }: Props) {
  const trpc = useTRPC()
  const { data: participant, isLoading } = useQuery(
    trpc.campaigns.getParticipant.queryOptions({ campaignId, participantId })
  )

  const queryClient = useQueryClient()
  const { mutate: apply } = useMutation({
    ...trpc.campaigns.addParticipant.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.campaigns.getParticipant.queryOptions({
          campaignId,
          participantId,
        }).queryKey,
      })

      toast.success("Aplicación enviada")
    },
  })

  if (isLoading) {
    return <span>Cargando...</span>
  }

  if (!participant) {
    return (
      <div className="flex flex-col gap-2">
        <span>Sin aplicación en la campaña</span>
        <Button
          className="w-fit"
          onClick={() => apply({ campaignId, participantId })}
        >
          Aplicar
        </Button>
      </div>
    )
  }

  return <span>Ya tiene una aplicación en esta campaña</span>
}
