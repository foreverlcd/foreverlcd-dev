const STOPWORDS = new Set(["de", "del", "la", "las", "el", "los", "y", "e", "o", "a", "en", "con", "para", "por", "of", "the", "and", "for"]);
const ROMAN: Record<string, string> = { I: "1", II: "2", III: "3", IV: "4", V: "5", VI: "6", VII: "7", VIII: "8", IX: "9", X: "10" };

/**
 * Siglas de un proyecto para su placa (2-4 caracteres).
 * Iniciales de las palabras significativas (camelCase parte en dos); ignora guiones sueltos y palabras vacías;
 * un romano (no inicial) pasa a dígito y un número conserva sus 2 últimas cifras; el primer número cierra las siglas.
 */
export function projectInitials(title: string): string {
  const tokens = title
    .split(/[\s\-–—_/]+/)
    .flatMap((token) => token.split(/(?<=[a-záéíóúñü])(?=[A-ZÁÉÍÓÚÑÜ])/u))
    .filter((token) => /[\p{L}\p{N}]/u.test(token));

  let out = "";
  for (const token of tokens) {
    if (STOPWORDS.has(token.toLowerCase())) continue;
    if (out && ROMAN[token]) {
      out += ROMAN[token].slice(-2);
      break;
    }
    if (/^\d+$/.test(token)) {
      out += token.slice(-2);
      break;
    }
    const first = token.match(/[\p{L}\p{N}]/u)?.[0];
    if (first) out += first.toUpperCase();
  }
  if (out.length < 2) {
    const letters = (tokens.find((t) => !STOPWORDS.has(t.toLowerCase())) ?? title).replace(/[^\p{L}\p{N}]/gu, "");
    out = letters.slice(0, 2).toUpperCase() || out;
  }
  return out.slice(0, 4);
}
