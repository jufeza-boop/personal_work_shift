import { z } from "zod";

const SHIFT_TYPES = ["morning", "day", "afternoon", "night"] as const;
const FREQUENCY_UNITS = ["daily", "weekly", "annual"] as const;

// Maximum recurrence interval: 365 covers the widest sensible span (annual once a year = interval 1,
// but a user could want "every 365 days" which is effectively annual too).
const MAX_FREQUENCY_INTERVAL = 365;

export const createPunctualEventSchema = z.object({
  description: z.string().trim().optional(),
  endTime: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    .optional()
    .or(z.literal("")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
  startTime: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    .optional()
    .or(z.literal("")),
  title: z.string().trim().min(1, "El título es obligatorio.").max(200),
});

export const createRecurringWorkEventSchema = z.object({
  category: z.enum(["work", "studies"]),
  description: z.string().trim().optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  frequencyInterval: z.coerce.number().int().min(1).max(MAX_FREQUENCY_INTERVAL),
  frequencyUnit: z.enum(FREQUENCY_UNITS),
  shiftType: z.enum(SHIFT_TYPES, { message: "Selecciona un tipo de turno." }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
  title: z.string().trim().min(1, "El título es obligatorio.").max(200),
});

export const createRecurringOtherEventSchema = z.object({
  description: z.string().trim().optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  endTime: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    .optional()
    .or(z.literal("")),
  frequencyInterval: z.coerce.number().int().min(1).max(MAX_FREQUENCY_INTERVAL),
  frequencyUnit: z.enum(FREQUENCY_UNITS),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
  startTime: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    .optional()
    .or(z.literal("")),
  title: z.string().trim().min(1, "El título es obligatorio.").max(200),
});

export type CreatePunctualEventFormInput = z.infer<
  typeof createPunctualEventSchema
>;
export type CreateRecurringWorkEventFormInput = z.infer<
  typeof createRecurringWorkEventSchema
>;
export type CreateRecurringOtherEventFormInput = z.infer<
  typeof createRecurringOtherEventSchema
>;
