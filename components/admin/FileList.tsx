import { DeleteFileButton } from "@/components/admin/DeleteFileButton";
import { DownloadFileButton } from "@/components/admin/DownloadFileButton";
import { formatDate } from "@/lib/constructions-labels";
import { formatFileSize } from "@/lib/validation/construction-file";
import type { ConstructionFile } from "@/lib/types";

const fileKindLabels: Record<ConstructionFile["file_type"], string> = {
  litematic: "Litematic",
  schem: "Schem",
  schematic: "Schematic",
};

export function FileList({
  constructionId,
  files,
}: {
  constructionId: string;
  files: ConstructionFile[];
}) {
  if (files.length === 0) {
    return <p className="text-sm text-muted">Aucun fichier pour l&apos;instant.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-surface text-left text-xs text-muted uppercase">
            <th className="px-4 py-3 font-medium">Nom</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Taille</th>
            <th className="px-4 py-3 font-medium">Ajouté</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-medium">{file.original_filename}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-muted">
                  {fileKindLabels[file.file_type]}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">{formatFileSize(file.file_size)}</td>
              <td className="px-4 py-3 text-muted">{formatDate(file.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <DownloadFileButton id={file.id} />
                  <DeleteFileButton
                    id={file.id}
                    constructionId={constructionId}
                    filename={file.original_filename}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
