import { z } from "zod";

const passwordMessage =
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
  password: z
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, passwordMessage),
});

export type LoginFormInput = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.infer<typeof registerSchema>;
