import type { IAvailableField } from "./formula.types";

export const KEYWORD_TO_RUNTIME = new Map<string, string>([
  ["AND", "&&"],
  ["OR", "||"],
  ["POW", "Math.pow"],
  ["SQRT", "Math.sqrt"],
  ["CEIL", "Math.ceil"],
  ["FLOOR", "Math.floor"],
  ["ROUND", "Math.round"],
  ["ABS", "Math.abs"],
  ["MIN", "Math.min"],
  ["MAX", "Math.max"],
  ["IF", "if"],
  ["ELSE", "else"],
]);

export const RUNTIME_TO_DISPLAY = new Map<string, string>([
  ["&&", " AND "],
  ["||", " OR "],
  ["Math.", ""],
]);

export const VALID_FUNCTIONS = [
  "POW",
  "SQRT",
  "ROUND",
  "CEIL",
  "FLOOR",
  "ABS",
  "IF",
  "ELSE",
  "OR",
  "AND",
  "MIN",
  "MAX",
] as const;

export const KEYWORD_LIST_PATTERN = VALID_FUNCTIONS.join("|");

/**
 * Convert a zero-based index to a spreadsheet-style letter code (A, B, ..., Z, AA, AB, ...).
 * Ported from available.mixin.js `numHash`.
 */
export function numHash(num: number): string {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  let n = num;

  while (n >= 0) {
    result = alpha[n % 26] + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

/**
 * Convert a runtime formula (with field aliases like `quantity_field_id_1`)
 * into a display formula (with letters like `A`, `B` and uppercase keywords).
 */
export function buildDisplayFormula(
  runtimeFormula: string,
  fields: IAvailableField[],
): string {
  if (!runtimeFormula) return "";

  const aliasPattern = fields.map((f) => escapeRegExp(f.alias)).join("|");
  const regex = new RegExp(
    `\\b(?:${aliasPattern})\\b|(\\|\\||&&|Math\\.)`,
    "g",
  );

  return runtimeFormula.replace(
    regex,
    (match) =>
      RUNTIME_TO_DISPLAY.get(match) ??
      fields.find((f) => f.alias === match)?.letter ??
      match,
  );
}

/**
 * Convert a display formula (with letters and uppercase keywords)
 * into a runtime formula (with field aliases and JS operators).
 */
export function buildRuntimeFormula(
  displayFormula: string,
  fields: IAvailableField[],
): string {
  if (!displayFormula) return "";

  const letterPattern = fields.map((f) => escapeRegExp(f.letter)).join("|");
  const regex = new RegExp(
    `\\b(?:${letterPattern}|${KEYWORD_LIST_PATTERN})\\b`,
    "g",
  );

  return displayFormula.replace(
    regex,
    (match) =>
      KEYWORD_TO_RUNTIME.get(match) ??
      fields.find((f) => f.letter === match)?.alias ??
      match,
  );
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
