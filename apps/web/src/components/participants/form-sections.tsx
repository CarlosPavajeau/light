import type { ParticipantFormInput } from "@light/api/schemas/participant"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@light/ui/components/field"
import { Input } from "@light/ui/components/input"
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@light/ui/components/reui/autocomplete"
import { PhoneInput } from "@light/ui/components/reui/phone-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@light/ui/components/select"
import { Controller, useFormContext } from "react-hook-form"
import type { FieldPath } from "react-hook-form"

import { accountTypes, bankNames, bankSwiftCodes } from "@/lib/constants"

type TextFieldProps<TName extends FieldPath<ParticipantFormInput>> = {
  name: TName
  label: string
  type?: "text" | "date" | "email"
}

function ParticipantTextField<TName extends FieldPath<ParticipantFormInput>>({
  name,
  label,
  type = "text",
}: TextFieldProps<TName>) {
  const { control } = useFormContext<ParticipantFormInput>()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            id={field.name}
            type={type}
            aria-invalid={fieldState.invalid}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

export function PersonalInfoSection() {
  const { control } = useFormContext<ParticipantFormInput>()

  return (
    <FieldSet>
      <FieldLegend>Información personal</FieldLegend>

      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <ParticipantTextField name="name" label="Nombres" />
          <ParticipantTextField name="lastName" label="Apellidos" />
        </div>

        <ParticipantTextField
          name="birthDate"
          label="Fecha de nacimiento"
          type="date"
        />

        <ParticipantTextField name="birthPlace" label="Lugar de nacimiento" />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="documentType"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Tipo de documento</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PT">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <ParticipantTextField
            name="documentNumber"
            label="Número de documento"
          />

          <ParticipantTextField
            name="documentIssueDate"
            label="Fecha de expedición"
            type="date"
          />

          <ParticipantTextField
            name="documentIssuePlace"
            label="Lugar de expedición"
          />
        </div>
      </FieldGroup>
    </FieldSet>
  )
}

export function PassportSection() {
  return (
    <FieldSet>
      <FieldLegend>Pasaporte (opcional)</FieldLegend>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <ParticipantTextField
            name="passportNumber"
            label="Número de pasaporte"
          />

          <ParticipantTextField
            name="passportIssuePlace"
            label="Lugar de expedición"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ParticipantTextField
            name="passportIssueDate"
            label="Fecha de expedición"
            type="date"
          />

          <ParticipantTextField
            name="passportExpirationDate"
            label="Fecha de vencimiento"
            type="date"
          />
        </div>
      </FieldGroup>
    </FieldSet>
  )
}

export function BankInfoSection() {
  const { control, setValue } = useFormContext<ParticipantFormInput>()

  return (
    <FieldSet>
      <FieldLegend>Información bancaria</FieldLegend>
      <FieldGroup>
        <ParticipantTextField name="accountNumber" label="N° de cuenta" />

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

        <ParticipantTextField name="swiftCode" label="Código SWIFT" />
      </FieldGroup>
    </FieldSet>
  )
}

export function ContactInfoSection() {
  const { control } = useFormContext<ParticipantFormInput>()

  return (
    <FieldSet>
      <FieldLegend>Información de contacto</FieldLegend>
      <FieldGroup>
        <ParticipantTextField
          name="email"
          label="Correo electrónico"
          type="email"
        />

        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Teléfono (opcional)</FieldLabel>
              <PhoneInput
                defaultCountry="CO"
                value={field.value ?? undefined}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <ParticipantTextField
          name="telegramUsername"
          label="Usuario de Telegram (opcional)"
        />
      </FieldGroup>
    </FieldSet>
  )
}

export function ResidenceSection() {
  return (
    <FieldSet>
      <FieldLegend>Residencia</FieldLegend>
      <FieldGroup>
        <ParticipantTextField
          name="residenceCountry"
          label="País de residencia"
        />

        <ParticipantTextField
          name="residenceState"
          label="Departamento / Estado"
        />

        <ParticipantTextField name="residenceCity" label="Ciudad" />

        <ParticipantTextField name="address" label="Dirección" />

        <ParticipantTextField
          name="postalCode"
          label="Código postal (opcional)"
        />
      </FieldGroup>
    </FieldSet>
  )
}
