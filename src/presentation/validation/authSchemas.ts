import { z } from "zod";

export const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const PASSWORD_POLICY_MESSAGE =
  "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Introduce un correo válido."),
  password: z.string().min(1, "Introduce tu contraseña."),
});

export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Introduce tu nombre.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  email: z.string().trim().toLowerCase().email("Introduce un correo válido."),
  password: z.string().regex(PASSWORD_POLICY_REGEX, PASSWORD_POLICY_MESSAGE),
});

export type LoginFormInput = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.infer<typeof registerSchema>;
