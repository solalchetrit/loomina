// Génère lib/photo-blur.ts : un aperçu flou (quelques centaines d'octets) de chaque
// photo de public/photos, montré le temps que la vraie photo se charge.
// À relancer après l'ajout ou le remplacement d'une photo : node scripts/photos/apercus.mjs
import { readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const dir = new URL("../../public/photos/", import.meta.url);
const files = (await readdir(dir)).filter((f) => f.endsWith(".jpg")).sort();
const lines = [];
for (const f of files) {
  const buf = await sharp(fileURLToPath(new URL(f, dir))).resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  lines.push(`  "${f.replace(/\.jpg$/, "")}": "data:image/webp;base64,${buf.toString("base64")}",`);
}
const out = `// Fichier généré par scripts/photos/apercus.mjs : ne pas modifier à la main.
// Aperçu flou de chaque photo de public/photos, affiché pendant son chargement.
export const PHOTO_BLUR: Record<string, string> = {
${lines.join("\n")}
};

/** Les props d'aperçu flou pour une photo de /public/photos (nom sans extension). */
export function blurOf(name: string) {
  const blurDataURL = PHOTO_BLUR[name];
  return blurDataURL ? ({ placeholder: "blur", blurDataURL } as const) : {};
}
`;
await writeFile(new URL("../../lib/photo-blur.ts", import.meta.url), out);
console.log(`${files.length} aperçus écrits dans lib/photo-blur.ts`);
