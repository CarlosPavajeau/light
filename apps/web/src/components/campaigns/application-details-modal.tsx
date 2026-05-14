import type { AppRouter } from "@light/api/routers/index"
import { Badge } from "@light/ui/components/badge"
import { Button } from "@light/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@light/ui/components/dialog"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { inferRouterOutputs } from "@trpc/server"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { ExternalLinkIcon } from "lucide-react"
import { useState } from "react"

import { useTRPC } from "@/utils/trpc"

import { DetailRow } from "../detail-row"

type Application =
  inferRouterOutputs<AppRouter>["campaigns"]["listApplications"][number]

type Participant = NonNullable<
  inferRouterOutputs<AppRouter>["participants"]["getById"]
>

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

function ParticipantInfo({ participant }: { participant: Participant }) {
  return (
    <>
      <DetailRow
        label="Documento"
        value={`${participant.documentType} - ${participant.documentNumber}`}
        subvalue={`Expedido: ${formatDate(participant.documentIssueDate)} en ${participant.documentIssuePlace}`}
      />
      {participant.documentExpirationDate && (
        <DetailRow
          label="Vencimiento documento"
          value={formatDate(participant.documentExpirationDate)}
        />
      )}
      <DetailRow label="Email" value={participant.email} />
      {participant.phone && (
        <DetailRow label="Teléfono" value={participant.phone} />
      )}
      {participant.telegramUsername && (
        <DetailRow label="Telegram" value={participant.telegramUsername} />
      )}
      <DetailRow
        label="Fecha de nacimiento"
        value={formatDate(participant.birthDate)}
        subvalue={`Lugar: ${participant.birthPlace}`}
      />
      <DetailRow
        label="Residencia"
        value={`${participant.residenceCity}, ${participant.residenceState}, ${participant.residenceCountry}`}
        subvalue={`${participant.address}${participant.postalCode ? ` - CP ${participant.postalCode}` : ""}`}
      />
    </>
  )
}

function ApplicationPaymentInfo({ application }: { application: Application }) {
  return (
    <>
      <DetailRow label="Voucher" value={application.voucher ?? "NA"} />
      <DetailRow
        label="Número de cuenta"
        value={application.accountNumber ?? "NA"}
      />
      <DetailRow
        label="Tipo de cuenta"
        value={application.accountType ?? "NA"}
      />
      <DetailRow label="Banco" value={application.bankName ?? "NA"} />
      {application.swiftCode && (
        <DetailRow label="Código SWIFT" value={application.swiftCode} />
      )}
      {application.wallet && (
        <DetailRow label="Billetera" value={application.wallet} />
      )}
      {application.walletType && (
        <DetailRow label="Tipo de billetera" value={application.walletType} />
      )}
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
    </>
  )
}

export function ApplicationDetailsModal({
  open,
  onOpenChange,
  application,
}: Props) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)

  const { data: participant } = useQuery({
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

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    ...trpc.campaigns.updateApplicationStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(
        trpc.campaigns.listApplications.queryFilter({
          campaignId: application?.campaignId ?? 0,
        })
      )
    },
  })

  const { mutate: discardApplication, isPending: isDiscarding } = useMutation({
    ...trpc.campaigns.deleteApplication.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(
        trpc.campaigns.listApplications.queryFilter({
          campaignId: application?.campaignId ?? 0,
        })
      )
      onOpenChange(false)
    },
  })

  const handleDownload = () => {
    if (!application || !application.attachedFile) {
      return
    }

    presignDownload(application.attachedFile)
  }

  const handleToggleStatus = () => {
    if (!application) {
      return
    }
    const newStatus = application.status === "pending" ? "reviewed" : "pending"
    updateStatus({
      campaignId: application.campaignId,
      participantId: application.participantId,
      status: newStatus,
    })
  }

  const handleDiscard = () => {
    if (!application) {
      return
    }
    discardApplication({
      campaignId: application.campaignId,
      participantId: application.participantId,
    })
  }

  if (!participant || !application) {
    return null
  }

  const name = `${application.name ?? "NA"} ${application.lastName ?? "NA"}`
  const isReviewed = application.status === "reviewed"

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setConfirmingDiscard(false)
        onOpenChange(next)
      }}
    >
      <DialogContent className="md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalles de la aplicación
            <Badge variant={isReviewed ? "default" : "secondary"}>
              {isReviewed ? "Revisada" : "Pendiente"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-4 max-h-[70vh] overflow-y-auto px-4">
          <dl className="flex flex-col gap-3">
            <DetailRow label="Nombre" value={name} />
            <ParticipantInfo participant={participant} />
            <ApplicationPaymentInfo application={application} />
          </dl>
        </div>

        {confirmingDiscard ? (
          <DialogFooter>
            <p className="mr-auto self-center text-sm text-muted-foreground">
              ¿Confirmar descarte?
            </p>
            <Button
              variant="outline"
              onClick={() => setConfirmingDiscard(false)}
              disabled={isDiscarding}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDiscard}
              disabled={isDiscarding}
            >
              Sí, descartar
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              onClick={() => setConfirmingDiscard(true)}
            >
              Descartar aplicación
            </Button>
            <Button
              variant={isReviewed ? "outline" : "default"}
              onClick={handleToggleStatus}
              disabled={isUpdatingStatus}
            >
              {isReviewed ? "Marcar como pendiente" : "Marcar como revisada"}
            </Button>
            <Button onClick={handleDownload} disabled={isPending}>
              Ver archivo adjunto
              <ExternalLinkIcon data-icon="inline-end" />
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
