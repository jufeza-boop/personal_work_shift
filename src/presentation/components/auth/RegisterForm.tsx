"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthSubmitButton } from "@/presentation/components/auth/AuthSubmitButton";
import { GoogleLoginButton } from "@/presentation/components/auth/GoogleLoginButton";
import {
  EMPTY_AUTH_FORM_STATE,
  type AuthFormAction,
  type AuthFormState,
} from "@/presentation/components/auth/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";

interface RegisterFormProps {
  action: AuthFormAction;
  state?: AuthFormState;
}

export function RegisterForm({
  action,
  state = EMPTY_AUTH_FORM_STATE,
}: RegisterFormProps) {
  const [formState, formAction] = useActionState(action, state);

  return (
    <Card className="w-full max-w-md border-stone-200 bg-white/90 shadow-xl">
      <CardHeader className="space-y-2">
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>
          Registra tu usuario para empezar a organizar los turnos familiares.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="displayName"
            >
              Nombre
            </label>
            <input
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
              id="displayName"
              name="displayName"
              type="text"
            />
            {formState.errors?.displayName ? (
              <p className="text-sm text-red-600">
                {formState.errors.displayName}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="email"
            >
              Correo electrónico
            </label>
            <input
              autoComplete="email"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
              id="email"
              name="email"
              type="email"
            />
            {formState.errors?.email ? (
              <p className="text-sm text-red-600">{formState.errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="password"
            >
              Contraseña
            </label>
            <input
              autoComplete="new-password"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
              id="password"
              name="password"
              type="password"
            />
            {formState.errors?.password ? (
              <p className="text-sm text-red-600">
                {formState.errors.password}
              </p>
            ) : null}
          </div>

          {formState.message ? (
            <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-slate-700">
              {formState.message}
            </p>
          ) : null}

          <AuthSubmitButton label="Crear cuenta" />
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-xs text-slate-400">o</span>
          </div>
        </div>

        <GoogleLoginButton />

        <p className="mt-4 text-sm text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <Link className="font-medium text-amber-700" href="/login">
            Inicia sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
