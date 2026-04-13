interface ShiftBlockProps {
  /** Hex color for the block background */
  color: string;
  /** Short label (member initials) shown inside the block */
  label: string;
}

export function ShiftBlock({ color, label }: ShiftBlockProps) {
  return (
    <div
      className="flex min-h-4 flex-1 items-center justify-center overflow-hidden px-0.5 text-[9px] font-semibold leading-none"
      style={{ backgroundColor: color }}
      title={label}
    >
      <span className="truncate text-slate-700">{label}</span>
    </div>
  );
}
