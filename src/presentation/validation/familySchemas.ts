import { z } from "zod";
import {
  ColorPalette,
  type ColorPaletteName,
} from "@/domain/value-objects/ColorPalette";

const FAMILY_NAME_MESSAGE = "El nombre no puede superar los 100 caracteres.";
const FAMILY_NAME_REQUIRED_MESSAGE = "Introduce un nombre para la familia.";

const colorPaletteNames = ColorPalette.availablePalettes() as [
  ColorPaletteName,
  ...ColorPaletteName[],
];

const familyNameSchema = z
  .string()
  .trim()
  .min(1, FAMILY_NAME_REQUIRED_MESSAGE)
  .max(100, FAMILY_NAME_MESSAGE);

export const selectPaletteSchema = z.object({
  colorPalette: z.enum(colorPaletteNames, {
    message: "Selecciona una paleta válida.",
  }),
});

export const createFamilySchema = z.object({
  name: familyNameSchema,
});

export const renameFamilySchema = z.object({
  name: familyNameSchema,
});

export const inviteFamilyMemberSchema = z.object({
  colorPalette: z.enum(colorPaletteNames, {
    message: "Selecciona una paleta válida.",
  }),
  email: z.string().trim().toLowerCase().email("Introduce un correo válido."),
});

export type CreateFamilyFormInput = z.infer<typeof createFamilySchema>;
export type InviteFamilyMemberFormInput = z.infer<
  typeof inviteFamilyMemberSchema
>;
export type RenameFamilyFormInput = z.infer<typeof renameFamilySchema>;
export type SelectPaletteFormInput = z.infer<typeof selectPaletteSchema>;
