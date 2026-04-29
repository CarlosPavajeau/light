import type { AppRouter } from "@light/api/routers/index"
import { Button } from "@light/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@light/ui/components/dialog"
import { Spinner } from "@light/ui/components/spinner"
import { useQuery } from "@tanstack/react-query"
import type { inferRouterOutputs } from "@trpc/server"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { ExternalLinkIcon } from "lucide-react"

import { useTRPC } from "@/utils/trpc"

import { DetailRow } from "../detail-row"

type Participant =
  inferRouterOutputs<AppRouter>["campaigns"]["listParticipants"][number]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  participant?: Participant
}

export function ApplicationDetailsModal({
  open,
  onOpenChange,
  participant,
}: Props) {
  const trpc = useTRPC()
  const { data: participantData } = useQuery({
    ...trpc.participants.getById.queryOptions(participant?.participantId ?? 0),
    enabled: !!participant?.participantId,
  })

  const { data: fileUrl, isLoading: loadingFileUrl } = useQuery({
    ...trpc.s3.createDownloadPresignedUrl.queryOptions({
      code: participant?.attachedFile ?? "",
    }),
    enabled: !!participant?.attachedFile,
  })

  if (!participantData || !participant) {
    return null
  }

  const name = `${participant.name ?? "NA"} ${participant.lastName ?? "NA"}`

  const formatDate = (value: string | null | undefined) => {
    if (!value) {
      return "NA"
    }
    try {
      return format(parseISO(value), "dd/MM/yyyy", { locale: es })
    } catch {
      return value
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de la aplicacion</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <dl className="flex flex-col gap-3">
            <DetailRow
              label="Documento"
              value={`${participantData.documentType ?? "NA"} - ${participantData.documentNumber ?? "NA"}`}
              subvalue={`Expedido: ${formatDate(participantData.documentIssueDate)} en ${participantData.documentIssuePlace ?? "NA"}`}
            />
            {participantData.documentExpirationDate && (
              <DetailRow
                label="Vencimiento documento"
                value={formatDate(participantData.documentExpirationDate)}
              />
            )}
            <DetailRow label="Nombre" value={name} />
            <DetailRow label="Email" value={participantData.email ?? "NA"} />
            {participantData.phone && (
              <DetailRow label="Teléfono" value={participantData.phone} />
            )}
            {participantData.telegramUsername && (
              <DetailRow
                label="Telegram"
                value={participantData.telegramUsername}
              />
            )}
            <DetailRow
              label="Fecha de nacimiento"
              value={formatDate(participantData.birthDate)}
              subvalue={`Lugar: ${participantData.birthPlace ?? "NA"}`}
            />
            <DetailRow
              label="Residencia"
              value={`${participantData.residenceCity ?? "NA"}, ${participantData.residenceState ?? "NA"}, ${participantData.residenceCountry ?? "NA"}`}
              subvalue={`${participantData.address ?? "NA"}${participantData.postalCode ? ` - CP ${participantData.postalCode}` : ""}`}
            />

            <DetailRow label="Voucher" value={participant.voucher ?? "NA"} />
            <DetailRow
              label="Número de cuenta"
              value={participant.accountNumber ?? "NA"}
            />
            <DetailRow
              label="Fecha de aplicación"
              value={format(participant.createdAt, "dd/MM/yyyy HH:mm a", {
                locale: es,
              })}
            />
          </dl>
        </div>

        <DialogFooter showCloseButton>
          <Button
            disabled={loadingFileUrl}
            render={
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={fileUrl ?? ""}
                aria-label="Ver archivo adjunto"
              />
            }
            nativeButton={false}
          >
            {loadingFileUrl && <Spinner />}
            Ver archivo adjunto
            <ExternalLinkIcon data-icon="inline-end" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
