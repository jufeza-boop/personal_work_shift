"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  requestPasswordResetAction,
  verifyOtpAction,
  updatePasswordAction,
} from "@/app/actions/auth";
import type { AuthFormState } from "@/presentation/components/auth/types";
import { EMPTY_AUTH_FORM_STATE } from "@/presentation/components/auth/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/presentation/components/ui/input-otp";

type Step = "email" | "otp" | "password";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [emailState, setEmailState] = useState<AuthFormState>(
    EMPTY_AUTH_FORM_STATE,
  );
  const [otpState, setOtpState] = useState<AuthFormState>(
    EMPTY_AUTH_FORM_STATE,
  );
  const [passwordState, setPasswordState] = useState<AuthFormState>(
    EMPTY_AUTH_FORM_STATE,
  );
  const [isPending, startTransition] = useTransition();

  function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const inputEmail =
      formData.get("email")?.toString().trim().toLowerCase() ?? "";

    startTransition(async () => {
      const result = await requestPasswordResetAction(
        EMPTY_AUTH_FORM_STATE,
        formData,
      );
      setEmailState(result);
      if (result.success) {
        setEmail(inputEmail);
        setStep("otp");
      }
    });
  }

  function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("email", email);
    formData.set("token", otpValue);

    startTransition(async () => {
      const result = await verifyOtpAction(EMPTY_AUTH_FORM_STATE, formData);
      setOtpState(result);
      if (result.success) {
        setStep("password");
      }
    });
  }

  function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updatePasswordAction(
        EMPTY_AUTH_FORM_STATE,
        formData,
      );
      setPasswordState(result);
    });
  }

  function handleResend() {
    setStep("email");
    setOtpState(EMPTY_AUTH_FORM_STATE);
    setOtpValue("");
  }

  return (
    <Card className="w-full max-w-md border-stone-200 bg-white/90 shadow-xl">
      {step === "email" && (
        <>
          <CardHeader className="space-y-2">
            <CardTitle>Recuperar contraseña</CardTitle>
            <CardDescription>
              Introduce tu correo electrónico y te enviaremos un código de 6
              dígitos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                {emailState.errors?.email ? (
                  <p className="text-sm text-red-600">
                    {emailState.errors.email}
                  </p>
                ) : null}
              </div>

              {emailState.message ? (
                <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-slate-700">
                  {emailState.message}
                </p>
              ) : null}

              <button
                className="bg-primary text-primary-foreground inline-flex w-full items-center justify-center rounded-full px-5 py-2 text-sm font-medium shadow-sm transition-colors disabled:pointer-events-none disabled:opacity-50"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Enviando..." : "Enviar código"}
              </button>
            </form>

            <p className="mt-4 text-sm text-slate-600">
              <Link className="font-medium text-amber-700" href="/login">
                Volver al inicio de sesión
              </Link>
            </p>
          </CardContent>
        </>
      )}

      {step === "otp" && (
        <>
          <CardHeader className="space-y-2">
            <CardTitle>Introduce el código</CardTitle>
            <CardDescription>
              Hemos enviado un código de 6 dígitos a{" "}
              <span className="font-medium text-slate-800">{email}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={setOtpValue}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  aria-label="Código de verificación de 6 dígitos"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                {otpState.errors?.password ? (
                  <p className="text-sm text-red-600">
                    {otpState.errors.password}
                  </p>
                ) : null}
              </div>

              {otpState.message ? (
                <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-slate-700">
                  {otpState.message}
                </p>
              ) : null}

              <button
                className="bg-primary text-primary-foreground inline-flex w-full items-center justify-center rounded-full px-5 py-2 text-sm font-medium shadow-sm transition-colors disabled:pointer-events-none disabled:opacity-50"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Verificando..." : "Verificar código"}
              </button>
            </form>

            <p className="mt-4 text-sm text-slate-600">
              ¿No recibiste el código?{" "}
              <button
                className="font-medium text-amber-700"
                onClick={handleResend}
                type="button"
              >
                Reenviar
              </button>
            </p>
          </CardContent>
        </>
      )}

      {step === "password" && (
        <>
          <CardHeader className="space-y-2">
            <CardTitle>Nueva contraseña</CardTitle>
            <CardDescription>
              Elige una contraseña segura para tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor="password"
                >
                  Nueva contraseña
                </label>
                <input
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                  id="password"
                  name="password"
                  type="password"
                />
                {passwordState.errors?.password ? (
                  <p className="text-sm text-red-600">
                    {passwordState.errors.password}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor="confirmPassword"
                >
                  Confirmar contraseña
                </label>
                <input
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                />
                {passwordState.errors?.displayName ? (
                  <p className="text-sm text-red-600">
                    {passwordState.errors.displayName}
                  </p>
                ) : null}
              </div>

              {passwordState.message ? (
                <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-slate-700">
                  {passwordState.message}
                </p>
              ) : null}

              <button
                className="bg-primary text-primary-foreground inline-flex w-full items-center justify-center rounded-full px-5 py-2 text-sm font-medium shadow-sm transition-colors disabled:pointer-events-none disabled:opacity-50"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Guardando..." : "Guardar contraseña"}
              </button>
            </form>
          </CardContent>
        </>
      )}
    </Card>
  );
}
