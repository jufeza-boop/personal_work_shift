import { z } from "zod";

const SHIFT_TYPES = ["morning", "day", "afternoon", "night"] as const;
const FREQUENCY_UNITS = ["daily", "weekly", "annual"] as const;
const CATEGORIES = ["work", "studies", "vacations", "other"] as const;

// Maximum recurrence interval: 365 covers the widest sensible span (annual once a year = interval 1,
// but a user could want "every 365 days" which is effectively annual too).
const MAX_FREQUENCY_INTERVAL = 365;

// Reusable schema for optional HH:MM time fields (empty string treated as absent).
const TIME_FIELD_SCHEMA = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  .optional()
  .or(z.literal(""));

// Shared cross-field validators for category/shiftType invariant
function isShiftTypeValid(data: { category?: string; shiftType?: string }) {
  if (data.category === "work" || data.category === "studies") {
    return !!data.shiftType;
  }
  return true;
}

function isShiftTypeAbsent(data: { category?: string; shiftType?: string }) {
  if (data.category === "other" || data.category === "vacations") {
    return !data.shiftType;
  }
  return true;
}

const SHIFT_TYPE_REQUIRED_REFINEMENT = {
  fn: isShiftTypeValid,
  opts: {
    message: "Selecciona un tipo de turno.",
    path: ["shiftType"] as string[],
  },
};

const SHIFT_TYPE_PROHIBITED_REFINEMENT = {
  fn: isShiftTypeAbsent,
  opts: {
    message: "Esta categoría no admite tipo de turno.",
    path: ["shiftType"] as string[],
  },
};

export const createPunctualEventSchema = z
  .object({
    description: z.string().trim().optional(),
    endTime: TIME_FIELD_SCHEMA,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
    startTime: TIME_FIELD_SCHEMA,
    title: z.string().trim().min(1, "El título es obligatorio.").max(200),
    category: z.enum(CATEGORIES).optional(),
    shiftType: z.enum(SHIFT_TYPES).optional().or(z.literal("")),
  })
  .refine(
    SHIFT_TYPE_REQUIRED_REFINEMENT.fn,
    SHIFT_TYPE_REQUIRED_REFINEMENT.opts,
  )
  .refine(
    SHIFT_TYPE_PROHIBITED_REFINEMENT.fn,
    SHIFT_TYPE_PROHIBITED_REFINEMENT.opts,
  );

export const createRecurringEventSchema = z
  .object({
    description: z.string().trim().optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .or(z.literal("")),
    endTime: TIME_FIELD_SCHEMA,
    frequencyInterval: z.coerce
      .number()
      .int()
      .min(1)
      .max(MAX_FREQUENCY_INTERVAL),
    frequencyUnit: z.enum(FREQUENCY_UNITS),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
    startTime: TIME_FIELD_SCHEMA,
    title: z.string().trim().min(1, "El título es obligatorio.").max(200),
    category: z.enum(CATEGORIES, { message: "Selecciona una categoría." }),
    shiftType: z.enum(SHIFT_TYPES).optional().or(z.literal("")),
  })
  .refine(
    SHIFT_TYPE_REQUIRED_REFINEMENT.fn,
    SHIFT_TYPE_REQUIRED_REFINEMENT.opts,
  )
  .refine(
    SHIFT_TYPE_PROHIBITED_REFINEMENT.fn,
    SHIFT_TYPE_PROHIBITED_REFINEMENT.opts,
  );

export type CreatePunctualEventFormInput = z.infer<
  typeof createPunctualEventSchema
>;
export type CreateRecurringEventFormInput = z.infer<
  typeof createRecurringEventSchema
>;

export const editEventBaseSchema = z.object({
  eventId: z.string().uuid(),
  scope: z.enum(["all", "single"]),
  occurrenceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  newDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
});

export const editPunctualEventSchema = editEventBaseSchema
  .extend({
    title: z.string().trim().min(1, "El título es obligatorio.").max(200),
    description: z.string().trim().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
    startTime: TIME_FIELD_SCHEMA,
    endTime: TIME_FIELD_SCHEMA,
    category: z.enum(CATEGORIES).optional().or(z.literal("")),
    shiftType: z.enum(SHIFT_TYPES).optional().or(z.literal("")),
  })
  .refine(
    SHIFT_TYPE_REQUIRED_REFINEMENT.fn,
    SHIFT_TYPE_REQUIRED_REFINEMENT.opts,
  )
  .refine(
    SHIFT_TYPE_PROHIBITED_REFINEMENT.fn,
    SHIFT_TYPE_PROHIBITED_REFINEMENT.opts,
  );

export const editRecurringEventSchema = editEventBaseSchema.extend({
  title: z.string().trim().min(1, "El título es obligatorio.").max(200),
  description: z.string().trim().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida.")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  frequencyUnit: z.enum(["daily", "weekly", "annual"]).optional(),
  frequencyInterval: z.coerce.number().int().min(1).max(365).optional(),
  category: z.enum(CATEGORIES).optional(),
  shiftType: z.enum(SHIFT_TYPES).optional().or(z.literal("")),
  startTime: TIME_FIELD_SCHEMA,
  endTime: TIME_FIELD_SCHEMA,
});

// Keep old schema names as aliases for backward compatibility during transition
/** @deprecated Use editRecurringEventSchema */
export const editRecurringWorkEventSchema = editRecurringEventSchema;
/** @deprecated Use editRecurringEventSchema */
export const editRecurringOtherEventSchema = editRecurringEventSchema;
