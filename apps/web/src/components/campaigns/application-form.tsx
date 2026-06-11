import { zodResolver } from "@hookform/resolvers/zod"
import type { AppRouter } from "@light/api/routers/index"
import { addApplicationSchema } from "@light/api/schemas/campaigns"
import { Alert, AlertDescription, AlertTitle } from "@light/ui/components/alert"
import { Button } from "@light/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@light/ui/components/field"
import { Input } from "@light/ui/components/input"
import { Spinner } from "@light/ui/components/spinner"
import type { FileWithPreview } from "@light/ui/hooks/use-file-upload"
import * as Sentry from "@sentry/tanstackstart-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { inferRouterOutputs } from "@trpc/server"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ExternalLinkIcon } from "lucide-react"
import { useCallback, useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { useTRPC, useTRPCClient } from "@/utils/trpc"

import { DetailRow } from "../detail-row"
import { ImageUpload } from "./image-upload"

type Application = NonNullable<
  inferRouterOutputs<AppRouter>["campaigns"]["getApplication"]
>

type Props = {
  campaignId: number
  participantId: number
}

const formatAmount = (value: string | number | null | undefined) => {
  if (!value) {
    return "NA"
  }
  const num = Number(value)
  if (Number.isNaN(num)) {
    return String(value)
  }
  return num.toLocaleString("es-ES", { style: "currency", currency: "COP" })
}

type UploadVoucherParams = {
  trpcClient: ReturnType<typeof useTRPCClient>
  file: File
  campaignId: number
  participantId: number
}

// Returns the uploaded file key, or null when the upload failed (already reported).
async function uploadVoucher({
  trpcClient,
  file,
  campaignId,
  participantId,
}: UploadVoucherParams): Promise<string | null> {
  let uploadUrlOrigin: string | undefined
  try {
    const { url, key } = await trpcClient.external.presignUpload.mutate()
    uploadUrlOrigin = new URL(url).origin

    const response = await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    })

    if (!response.ok) {
      let responseBody: string | undefined
      try {
        responseBody = await response.text()
      } catch {
        console.error("failed to read S3 error response body")
      }

      console.error("voucher upload HTTP error", {
        status: response.status,
        statusText: response.statusText,
        body: responseBody,
        url: uploadUrlOrigin,
      })

      throw new Error(
        `Upload failed with status ${response.status}: ${response.statusText}`,
        {
          cause: {
            status: response.status,
            statusText: response.statusText,
            body: responseBody,
            url: uploadUrlOrigin,
          },
        }
      )
    }

    return key
  } catch (error) {
    console.error("voucher upload failed", {
      error,
      uploadUrlOrigin,
      fileType: file.type,
      fileSize: file.size,
    })

    Sentry.withScope((scope) => {
      scope.setTag("action", "voucher_upload")
      scope.setTag(
        "error_type",
        error instanceof TypeError ? "network_error" : "http_error"
      )
      scope.setContext("campaign_application", {
        campaignId,
        participantId,
        fileType: file.type,
        fileSize: file.size,
        uploadUrlOrigin,
      })
      if (error instanceof Error && error.cause) {
        scope.setExtra("response_details", error.cause)
      }
      Sentry.captureException(error)
    })
    return null
  }
}

function NewApplicationForm({ campaignId, participantId }: Props) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const selectedFileRef = useRef<File | null>(null)

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(addApplicationSchema),
    defaultValues: {
      campaignId,
      participantId,
      voucher: "",
      wallet: "",
      walletType: "",
      authorizedAccount: "",
      attachedFile: "",
      amount: "",
    },
  })

  const { mutateAsync: apply } = useMutation({
    ...trpc.campaigns.addApplication.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.campaigns.getApplication.queryOptions({
          campaignId,
          participantId,
        }).queryKey,
      })

      toast.success("Aplicación enviada")
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    const selectedFile = selectedFileRef.current
    if (!selectedFile) {
      setError("attachedFile", {
        message: "El comprobante de pago es obligatorio",
      })
      return
    }

    const attachedFile = await uploadVoucher({
      trpcClient,
      file: selectedFile,
      campaignId,
      participantId,
    })
    if (!attachedFile) {
      setError("attachedFile", {
        message: "Error al subir el comprobante de pago. Inténtalo de nuevo",
      })
      return
    }

    try {
      await apply({ ...data, attachedFile })
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag("action", "submit_application")
        scope.setContext("campaign_application", {
          campaignId,
          participantId,
        })
        Sentry.captureException(error)
      })
      toast.error("Error al enviar la aplicación")
    }
  })

  const handleFilesChange = useCallback(
    (files: FileWithPreview[]) => {
      const newFile = files.at(0)
      if (!newFile) {
        selectedFileRef.current = null
        setValue("attachedFile", "", { shouldValidate: true })
        return
      }

      selectedFileRef.current = newFile.file as File
      setValue("attachedFile", "selected", { shouldValidate: true })
    },
    [setValue]
  )

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Controller
          control={control}
          name="voucher"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>N° Voucher</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                Ingresa el número de la cuenta a la que realizaste la
                consignación.
              </FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="wallet"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Billetera</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="walletType"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Tipo de billetera</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <Controller
          control={control}
          name="authorizedAccount"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Cuenta autorizada</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Valor consignado</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="number"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="attachedFile"
          render={({ fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Comprobante de pago</FieldLabel>
              <ImageUpload onFilesChange={handleFilesChange} />
              <FieldDescription>
                Debes subir una imagen legible del comprobante de pago.
              </FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        className="mt-6 w-full"
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting && <Spinner />}
        Enviar aplicación
      </Button>
    </form>
  )
}

function SubmittedApplicationDetails({
  application,
}: {
  application: Application
}) {
  const trpc = useTRPC()

  const { mutate: presignDownload, isPending: isDownloadPending } = useMutation(
    {
      ...trpc.external.presignDownload.mutationOptions(),
      onSuccess: (result) => {
        if (result.url) {
          window.open(result.url, "_blank", "noopener")
        }
      },
    }
  )

  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <AlertTitle>Ya aplicaste a esta campaña</AlertTitle>
        <AlertDescription>
          Aquí están los datos de tu aplicación registrada.
        </AlertDescription>
      </Alert>

      <dl className="flex flex-col gap-3">
        <DetailRow label="Voucher" value={application.voucher ?? "NA"} />
        <DetailRow
          label="Cuenta autorizada"
          value={application.authorizedAccount ?? "NA"}
        />
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
          value={formatAmount(application.amount)}
        />
        <DetailRow
          label="Fecha de aplicación"
          value={format(application.createdAt, "dd/MM/yyyy HH:mm a", {
            locale: es,
          })}
        />
      </dl>

      {application.attachedFile && (
        <Button
          variant="outline"
          onClick={() => {
            if (application.attachedFile) {
              presignDownload(application.attachedFile)
            }
          }}
          disabled={isDownloadPending}
        >
          {isDownloadPending && <Spinner />}
          Ver archivo adjunto
          <ExternalLinkIcon data-icon="inline-end" />
        </Button>
      )}
    </div>
  )
}

export function CampaignApplicationForm({ campaignId, participantId }: Props) {
  const trpc = useTRPC()

  const { data: application, isLoading } = useQuery({
    ...trpc.campaigns.getApplication.queryOptions({
      campaignId,
      participantId,
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })

  if (isLoading) {
    return <span>Cargando...</span>
  }

  if (!application) {
    return (
      <NewApplicationForm
        campaignId={campaignId}
        participantId={participantId}
      />
    )
  }

  return <SubmittedApplicationDetails application={application} />
}
