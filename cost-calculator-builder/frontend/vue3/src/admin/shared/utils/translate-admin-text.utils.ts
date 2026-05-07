const NON_WORDS_REGEX = /[^a-z0-9]+/g;

const normalizeText = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\//g, " ")
    .replace(/['"`]/g, "")
    .replace(NON_WORDS_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const toCamelCaseKey = (value: string): string => {
  const normalized = normalizeText(value);
  if (!normalized) return "";

  const [first = "", ...rest] = normalized.split(" ");
  return `${first}${rest.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("")}`;
};

type ITranslationsMap = Record<string, unknown>;

export const translateAdminText = (
  value: unknown,
  translations: ITranslationsMap,
): string => {
  if (typeof value !== "string") {
    return typeof value === "number" ? String(value) : "";
  }

  const cleanValue = value.trim();
  if (!cleanValue) return value;

  if (typeof translations[cleanValue] === "string") {
    return translations[cleanValue] as string;
  }

  const dynamicKey = toCamelCaseKey(cleanValue);
  if (dynamicKey && typeof translations[dynamicKey] === "string") {
    return translations[dynamicKey] as string;
  }

  return value;
};
