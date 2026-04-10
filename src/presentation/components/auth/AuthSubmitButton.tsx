"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/presentation/components/ui/button";

interface AuthSubmitButtonProps {
  label: string;
}

export function AuthSubmitButton({ label }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? "Enviando..." : label}
    </Button>
  );
}
