"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/presentation/components/ui/button";
import { Spinner } from "@/presentation/components/ui/Spinner";

interface SubmitButtonProps extends Omit<
  ButtonProps,
  "type" | "disabled" | "children"
> {
  label: string;
  pendingLabel: string;
}

export function SubmitButton({
  label,
  pendingLabel,
  ...buttonProps
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" {...buttonProps}>
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size="sm" />
          {pendingLabel}
        </span>
      ) : (
        label
      )}
    </Button>
  );
}
