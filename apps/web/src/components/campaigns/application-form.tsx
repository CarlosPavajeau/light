import { zodResolver } from "@hookform/resolvers/zod"
import { addParticipantSchema } from "@light/api/schemas/campaigns"
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@light/ui/components/field"
import { Input } from "@light/ui/components/input"
import { Spinner } from "@light/ui/components/spinner"
import type { FileWithPreview } from "@light/ui/hooks/use-file-upload"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FolderIcon } from "lucide-react"
import { useCallback, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

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

  const { data: participant, isLoading } = useQuery({
    ...trpc.campaigns.getParticipant.queryOptions({
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
    resolver: zodResolver(addParticipantSchema),
    defaultValues: {
      campaignId,
      participantId,
      voucher: "",
      accountNumber: "",
      attachedFile: "",
      amount: "",
    },
  })

  const queryClient = useQueryClient()
  const { mutateAsync: apply } = useMutation({
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

  if (!participant) {
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
