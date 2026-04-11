"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/presentation/components/ui/button";

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
      {pending ? pendingLabel : label}
    </Button>
  );
}
