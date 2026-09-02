import { parse as parseNbt } from "prismarine-nbt";

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export const ALLOWED_FILE_EXTENSIONS = ["litematic", "schem", "schematic"] as const;
export type FileKind = (typeof ALLOWED_FILE_EXTENSIONS)[number];

export type FileActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialFileActionState: FileActionState = { status: "idle" };

/**
 * Clés NBT de haut niveau attendues pour chaque format, à titre indicatif
 * (les vraies structures varient selon la version d'export du mod/plugin,
 * donc on exige qu'AU MOINS UNE de ces clés soit présente — suffisant pour
 * distinguer un vrai fichier d'un NBT gzippé quelconque, sans reconstruire
 * un parseur Minecraft complet).
 */
const EXPECTED_TOP_LEVEL_KEYS: Record<FileKind, string[]> = {
  litematic: ["Metadata", "Regions", "MinecraftDataVersion", "Version"],
  schem: ["Palette", "BlockData", "PaletteMax", "Width", "Version"],
  schematic: ["Blocks", "Width", "Height", "Length", "Materials"],
};

function extensionOf(filename: string): string | null {
  const match = /\.([a-z0-9]+)$/i.exec(filename.trim());
  return match ? match[1].toLowerCase() : null;
}

export function fileKindFromFilename(filename: string): FileKind | null {
  const ext = extensionOf(filename);
  return ext && (ALLOWED_FILE_EXTENSIONS as readonly string[]).includes(ext) ? (ext as FileKind) : null;
}

export type FileValidationResult =
  | { ok: true; fileType: FileKind }
  | { ok: false; message: string };

/**
 * Valide un fichier de construction :
 * 1. extension autorisée (déduite du nom d'origine)
 * 2. taille réelle du contenu (pas une valeur déclarée par le client)
 * 3. signature gzip (les 3 formats supportés sont tous du NBT gzippé)
 * 4. structure NBT effectivement valide (parse + vérification EOF, via
 *    prismarine-nbt) et présence d'au moins une clé de haut niveau plausible
 *    pour le format annoncé — empêche qu'un fichier quelconque renommé avec
 *    la bonne extension soit accepté tel quel.
 */
export async function validateConstructionFile(
  filename: string,
  size: number,
  bytes: Uint8Array,
): Promise<FileValidationResult> {
  const fileType = fileKindFromFilename(filename);
  if (!fileType) {
    return {
      ok: false,
      message: `${filename} : extension non autorisée (.litematic, .schem, .schematic uniquement).`,
    };
  }

  if (size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, message: `${filename} : dépasse 20 Mo.` };
  }

  if (bytes.length < 2 || bytes[0] !== 0x1f || bytes[1] !== 0x8b) {
    return {
      ok: false,
      message: `${filename} : ne ressemble pas à un fichier ${fileType} valide (signature gzip absente).`,
    };
  }

  try {
    const { parsed } = await parseNbt(Buffer.from(bytes));
    const topLevelKeys = Object.keys(parsed.value ?? {});
    const expected = EXPECTED_TOP_LEVEL_KEYS[fileType];
    const looksRight = topLevelKeys.some((key) => expected.includes(key));

    if (!looksRight) {
      return {
        ok: false,
        message: `${filename} : structure NBT valide mais ne correspond pas à un fichier ${fileType} reconnu.`,
      };
    }
  } catch {
    return {
      ok: false,
      message: `${filename} : contenu invalide (pas un fichier NBT gzippé exploitable).`,
    };
  }

  return { ok: true, fileType };
}

