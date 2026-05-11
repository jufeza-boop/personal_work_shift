/**
 * Spanish month names used across calendar components.
 * MONTH_NAMES_SHORT: Title-cased abbreviations for month headers (e.g. "Enero").
 * MONTH_NAMES_FULL: Lower-case full names for use within sentences (e.g. "enero").
 */
export const MONTH_NAMES_SHORT = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export const MONTH_NAMES_FULL = MONTH_NAMES_SHORT.map((m) =>
  m.toLowerCase(),
) as unknown as readonly [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
