/** Parses the routine table's pipe-delimited textarea format: one row per line, cells split on "|". */
export function parseRows(text: string): string[][] {
  return text
    .split("\n")
    .map((line) => line.split("|").map((c) => c.trim()))
    .filter((r) => r.some(Boolean));
}
