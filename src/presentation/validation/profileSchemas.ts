import { z } from "zod";

export const updateDisplayNameSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "El nombre no puede estar vacío.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
});

const passwordMessage =
  "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.";

export const updateProfilePasswordSchema = z
  .object({
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña."),
    newPassword: z
      .string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, passwordMessage),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type UpdateDisplayNameInput = z.infer<typeof updateDisplayNameSchema>;
export type UpdateProfilePasswordInput = z.infer<
  typeof updateProfilePasswordSchema
>;
