import { Button } from "@light/ui/components/button"
import type {
  FileMetadata,
  FileWithPreview,
} from "@light/ui/hooks/use-file-upload"
import { formatBytes, useFileUpload } from "@light/ui/hooks/use-file-upload"
import { cn } from "@light/ui/lib/utils"
import { FileIcon, PlusIcon, XIcon } from "lucide-react"

const maxSize = 5 * 1024 * 1024
const accept = "image/*"
const maxFiles = 1

const isImage = (file: File | FileMetadata) => {
  const type = file instanceof File ? file.type : file.type
  return type.startsWith("image/")
}

type Props = {
  className?: string
  onFilesChange: (files: FileWithPreview[]) => void
}

export function ImageUpload({ className, onFilesChange }: Props) {
  const [
    { files, isDragging, errors },
    {
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    onFilesChange,
  })

  return (
    <div className={cn("w-full max-w-4xl", className)}>
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-4 transition-colors md:flex-row",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps()} className="sr-only" />
        {/* Upload Button */}
        <Button
          onClick={openFileDialog}
          size="lg"
          className={cn(isDragging && "animate-bounce")}
        >
          <PlusIcon />
          Agregar archivo
        </Button>
        {/* File Previews */}
        <div className="flex flex-1 items-center gap-2">
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Arrastra y suelta los archivos aquí o haz clic para buscar (max{" "}
              {maxFiles} archivos)
            </p>
          ) : (
            files.map((fileItem) => (
              <div key={fileItem.id} className="group/item relative shrink-0">
                {isImage(fileItem.file) && fileItem.preview ? (
                  <img
                    src={fileItem.preview}
                    alt={fileItem.file.name}
                    className="h-12 w-12 rounded-lg border object-cover"
                    title={`${fileItem.file.name} (${formatBytes(fileItem.file.size)})`}
                  />
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted"
                    title={`${fileItem.file.name} (${formatBytes(fileItem.file.size)})`}
                  >
                    <FileIcon />
                  </div>
                )}
                {/* Remove Button */}
                <Button
                  onClick={() => removeFile(fileItem.id)}
                  variant="outline"
                  size="icon"
                  className="absolute -inset-e-2 -top-2 size-5 rounded-full opacity-0 shadow-md transition-opacity group-hover/item:opacity-100"
                >
                  <XIcon />
                </Button>
              </div>
            ))
          )}
        </div>
        {/* File Count */}
        {files.length > 0 && (
          <div className="shrink-0 text-xs text-muted-foreground">
            {files.length}/{maxFiles}
          </div>
        )}
      </div>
      {/* Error Messages */}
      {errors.length > 0 && (
        <>
          {errors.map((error, index) => (
            <p key={index} className="last:mb-0">
              {error}
            </p>
          ))}
        </>
      )}
    </div>
  )
}
