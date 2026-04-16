"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/presentation/components/ui/button";
import { Spinner } from "@/presentation/components/ui/Spinner";

interface AuthSubmitButtonProps {
  label: string;
}

export function AuthSubmitButton({ label }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size="sm" />
          Enviando...
        </span>
      ) : (
        label
      )}
    </Button>
  );
}
