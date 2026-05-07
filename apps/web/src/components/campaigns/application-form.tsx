import { zodResolver } from "@hookform/resolvers/zod"
import { addApplicationSchema } from "@light/api/schemas/campaigns"
import { Button } from "@light/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@light/ui/components/empty"
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FolderIcon } from "lucide-react"
import { useCallback, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { accountTypes, bankNames, bankSwiftCodes } from "@/lib/constants"
import { useTRPC, useTRPCClient } from "@/utils/trpc"

import { ImageUpload } from "./image-upload"

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

    let attachedFile: string
    try {
      const { url, key } = await trpcClient.external.presignUpload.mutate()

      const response = await fetch(url, {
        method: "PUT",
        body: selectedFile,
        headers: { "Content-Type": selectedFile.type },
      })

      if (!response.ok) {
        throw new Error("Error al subir el comprobante de pago")
      }

      attachedFile = key
    } catch {
      setError("attachedFile", {
        message: "Error al subir el comprobante de pago",
      })
      return
    }

    await apply({ ...data, attachedFile })
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
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderIcon />
        </EmptyMedia>
        <EmptyTitle>Aplicación enviada</EmptyTitle>
        <EmptyDescription>
          Ya tiene una aplicación en esta campaña
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
