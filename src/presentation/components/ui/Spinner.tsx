import { cn } from "@/shared/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-6 w-6 border-[3px]",
};

export function Spinner({ size = "sm", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn(
        "inline-block animate-spin rounded-full border-current border-t-transparent",
        sizeClasses[size],
        className,
      )}
    />
  );
}
