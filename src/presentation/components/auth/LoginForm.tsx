"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthSubmitButton } from "@/presentation/components/auth/AuthSubmitButton";
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

interface LoginFormProps {
  action: AuthFormAction;
  redirectTo?: string;
  state?: AuthFormState;
}

export function LoginForm({
  action,
  redirectTo = "/calendar",
  state = EMPTY_AUTH_FORM_STATE,
}: LoginFormProps) {
  const [formState, formAction] = useActionState(action, state);

  return (
    <Card className="w-full max-w-md border-stone-200 bg-white/90 shadow-xl">
      <CardHeader className="space-y-2">
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>
          Accede a tu calendario familiar con tu correo y contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input name="redirectTo" type="hidden" value={redirectTo} />

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
              autoComplete="current-password"
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

          <AuthSubmitButton label="Entrar" />
        </form>

        <p className="mt-4 text-sm text-slate-600">
          ¿Necesitas una cuenta?{" "}
          <Link className="font-medium text-amber-700" href="/register">
            Regístrate
          </Link>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <Link className="font-medium text-amber-700" href="/forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
