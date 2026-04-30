import type { AppRouter } from "@light/api/routers/index"
import { Button } from "@light/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@light/ui/components/dialog"
import { useMutation, useQuery } from "@tanstack/react-query"
import type { inferRouterOutputs } from "@trpc/server"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { ExternalLinkIcon } from "lucide-react"

import { useTRPC } from "@/utils/trpc"

import { DetailRow } from "../detail-row"

type Application =
  inferRouterOutputs<AppRouter>["campaigns"]["listApplications"][number]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  application?: Application
}

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

const formatAmount = (value: number | null | undefined) => {
  if (!value) {
    return "NA"
  }
  return value.toLocaleString("es-ES", { style: "currency", currency: "COP" })
}

export function ApplicationDetailsModal({
  open,
  onOpenChange,
  application,
}: Props) {
  const trpc = useTRPC()
  const { data: participantData } = useQuery({
    ...trpc.participants.getById.queryOptions(application?.participantId ?? 0),
    enabled: !!application?.participantId,
  })

  const { mutate: presignDownload, isPending } = useMutation({
    ...trpc.external.presignDownload.mutationOptions(),
    onSuccess: (result) => {
      if (result.url) {
        window.open(result.url, "_blank")
      }
    },
  })

  const handleDownload = () => {
    if (!application || !application.attachedFile) {
      return
    }

    presignDownload(application.attachedFile)
  }

  if (!participantData || !application) {
    return null
  }

  const name = `${application.name ?? "NA"} ${application.lastName ?? "NA"}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de la aplicación</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <dl className="flex flex-col gap-3">
            <DetailRow
              label="Documento"
              value={`${participantData.documentType} - ${participantData.documentNumber}`}
              subvalue={`Expedido: ${formatDate(participantData.documentIssueDate)} en ${participantData.documentIssuePlace}`}
            />
            {participantData.documentExpirationDate && (
              <DetailRow
                label="Vencimiento documento"
                value={formatDate(participantData.documentExpirationDate)}
              />
            )}
            <DetailRow label="Nombre" value={name} />
            <DetailRow label="Email" value={participantData.email} />
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
              subvalue={`Lugar: ${participantData.birthPlace}`}
            />
            <DetailRow
              label="Residencia"
              value={`${participantData.residenceCity}, ${participantData.residenceState}, ${participantData.residenceCountry}`}
              subvalue={`${participantData.address}${participantData.postalCode ? ` - CP ${participantData.postalCode}` : ""}`}
            />

            <DetailRow label="Voucher" value={application.voucher ?? "NA"} />
            <DetailRow
              label="Número de cuenta"
              value={application.accountNumber ?? "NA"}
            />
            <DetailRow
              label="Valor consignado"
              value={formatAmount(Number(application.amount))}
            />
            <DetailRow
              label="Fecha de aplicación"
              value={format(application.createdAt, "dd/MM/yyyy HH:mm a", {
                locale: es,
              })}
            />
          </dl>
        </div>

        <DialogFooter showCloseButton>
          <Button onClick={handleDownload} disabled={isPending}>
            Ver archivo adjunto
            <ExternalLinkIcon data-icon="inline-end" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
