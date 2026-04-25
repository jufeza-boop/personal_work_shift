import { z } from "zod";
import {
  ColorPalette,
  type ColorPaletteName,
} from "@/domain/value-objects/ColorPalette";

const colorPaletteNames = ColorPalette.availablePalettes() as [
  ColorPaletteName,
  ...ColorPaletteName[],
];

export const acceptInvitationSchema = z.object({
  colorPalette: z.enum(colorPaletteNames, {
    message: "Selecciona una paleta válida.",
  }),
  token: z.string().trim().min(1, "El token de invitación es inválido."),
});

export type AcceptInvitationFormInput = z.infer<typeof acceptInvitationSchema>;
