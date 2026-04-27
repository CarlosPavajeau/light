"use client"

import { Button } from "@light/ui/components/button"
import { Calendar } from "@light/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@light/ui/components/popover"
import { cn } from "@light/ui/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"

type DatePickerProps = {
  onChange: (date: Date) => void
  value: Date | undefined
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function DatePicker({
  onChange,
  value,
  disabled = false,
  placeholder = "Seleccionar fecha",
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            disabled={disabled}
            variant={"outline"}
            data-empty={!value}
            className={cn(
              "w-53 justify-between text-left font-normal data-[empty=true]:text-muted-foreground",
              className
            )}
          >
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
            <ChevronDownIcon data-icon="inline-end" />
          </Button>
        }
      />

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          autoFocus
          mode="single"
          selected={value}
          onSelect={handleSelect}
          locale={es}
        />
      </PopoverContent>
    </Popover>
  )
}
