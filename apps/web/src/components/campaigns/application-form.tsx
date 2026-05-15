import { zodResolver } from "@hookform/resolvers/zod"
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
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@light/ui/components/reui/autocomplete"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@light/ui/components/select"
import { Spinner } from "@light/ui/components/spinner"
import type { FileWithPreview } from "@light/ui/hooks/use-file-upload"
import * as Sentry from "@sentry/tanstackstart-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ExternalLinkIcon } from "lucide-react"
import { useCallback, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { accountTypes, bankNames, bankSwiftCodes } from "@/lib/constants"
import { useTRPC, useTRPCClient } from "@/utils/trpc"

import { DetailRow } from "../detail-row"
import { ImageUpload } from "./image-upload"

const formatAmount = (value: string | null | undefined) => {
  if (!value) {
    return "NA"
  }
  const num = Number(value)
  if (Number.isNaN(num)) {
    return value
  }
  return num.toLocaleString("es-ES", { style: "currency", currency: "COP" })
}

type Props = {
  campaignId: number
  participantId: number
}

export function CampaignApplicationForm({ campaignId, participantId }: Props) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { data: application, isLoading } = useQuery({
    ...trpc.campaigns.getApplication.queryOptions({
      campaignId,
      participantId,
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })

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
      accountNumber: "",
      accountType: "",
      bankName: "",
      swiftCode: "",
      wallet: "",
      walletType: "",
      attachedFile: "",
      amount: "",
    },
  })

  const queryClient = useQueryClient()
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
    if (!selectedFile) {
      setError("attachedFile", {
        message: "El comprobante de pago es obligatorio",
      })
      return
    }

    let attachedFile: string | undefined
    try {
      const { url, key } = await trpcClient.external.presignUpload.mutate()

      const response = await fetch(url, {
        method: "PUT",
        body: selectedFile,
        headers: { "Content-Type": selectedFile.type },
      })

      if (!response.ok) {
        throw new Error(
          `Upload failed with status ${response.status}: ${response.statusText}`
        )
      }

      attachedFile = key
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag("action", "voucher_upload")
        scope.setContext("campaign_application", {
          campaignId,
          participantId,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        })
        Sentry.captureException(error)
      })
      setError("attachedFile", {
        message: "Error al subir el comprobante de pago",
      })
      return
    }

    if (!attachedFile) {
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
        setSelectedFile(null)
        setValue("attachedFile", "", { shouldValidate: true })
        return
      }

      setSelectedFile(newFile.file as File)
      setValue("attachedFile", "selected", { shouldValidate: true })
    },
    [setValue]
  )

  const { mutate: presignDownload, isPending: isDownloadPending } = useMutation(
    {
      ...trpc.external.presignDownload.mutationOptions(),
      onSuccess: (result) => {
        if (result.url) {
          window.open(result.url, "_blank")
        }
      },
    }
  )

  if (isLoading) {
    return <span>Cargando...</span>
  }

  if (!application) {
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
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="accountNumber"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>N° de cuenta</FieldLabel>
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
            name="accountType"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Tipo de cuenta</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecciona un tipo de cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="bankName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Banco</FieldLabel>
                <Autocomplete
                  items={bankNames}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    if (value) {
                      setValue("swiftCode", bankSwiftCodes[value] ?? "")
                    }
                  }}
                >
                  <AutocompleteInput showTrigger showClear />
                  <AutocompleteContent>
                    <AutocompleteList>
                      {(item) => (
                        <AutocompleteItem key={item} value={item}>
                          {item}
                        </AutocompleteItem>
                      )}
                    </AutocompleteList>
                  </AutocompleteContent>
                </Autocomplete>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="swiftCode"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Código SWIFT</FieldLabel>
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
                  <FieldLabel htmlFor={field.name}>
                    Tipo de billetera
                  </FieldLabel>
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
          onClick={() => presignDownload(application.attachedFile ?? "")}
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
