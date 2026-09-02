import { formatFileSize } from "@/lib/format";

const fileKindLabels: Record<"litematic" | "schem" | "schematic", string> = {
  litematic: "Litematic",
  schem: "Schem",
  schematic: "Schematic",
};

export type FileRow = {
  id: string;
  original_filename: string;
  file_type: "litematic" | "schem" | "schematic";
  file_size: number;
};

export function ConstructionFilesList({ files }: { files: FileRow[] }) {
  if (files.length === 0) return null;

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
      {files.map((file) => (
        <li key={file.id} className="flex flex-wrap items-center justify-between gap-3 bg-surface px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-fg">{file.original_filename}</p>
            <p className="text-xs text-muted">
              {fileKindLabels[file.file_type]} · {formatFileSize(file.file_size)}
            </p>
          </div>
          <button
            type="button"
            disabled
            title="Le téléchargement public arrive dans une prochaine étape"
            className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm text-muted opacity-50"
          >
            Bientôt disponible
          </button>
        </li>
      ))}
    </ul>
  );
}
