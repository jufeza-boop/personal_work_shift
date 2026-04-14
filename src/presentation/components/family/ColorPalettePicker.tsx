import type { ColorPaletteName } from "@/domain/value-objects/ColorPalette";

const PALETTE_LABELS: Record<ColorPaletteName, string> = {
  amber: "Ámbar",
  coral: "Coral",
  emerald: "Esmeralda",
  rose: "Rosa",
  sky: "Cielo",
  slate: "Pizarra",
  teal: "Turquesa",
  violet: "Violeta",
};

// Tones ordered from lightest to darkest (morning → day → afternoon → night)
const TONE_KEYS = ["morning", "day", "afternoon", "night"] as const;

const PALETTE_TONES: Record<ColorPaletteName, Record<string, string>> = {
  amber: {
    morning: "#FEF3C7",
    day: "#FDE68A",
    afternoon: "#FCD34D",
    night: "#D97706",
  },
  coral: {
    morning: "#FFE5D9",
    day: "#FEC5BB",
    afternoon: "#FCA5A5",
    night: "#EA580C",
  },
  emerald: {
    morning: "#D1FAE5",
    day: "#A7F3D0",
    afternoon: "#6EE7B7",
    night: "#059669",
  },
  rose: {
    morning: "#FFE4E6",
    day: "#FECDD3",
    afternoon: "#FDA4AF",
    night: "#E11D48",
  },
  sky: {
    morning: "#E0F2FE",
    day: "#BAE6FD",
    afternoon: "#7DD3FC",
    night: "#0284C7",
  },
  slate: {
    morning: "#E2E8F0",
    day: "#CBD5E1",
    afternoon: "#94A3B8",
    night: "#475569",
  },
  teal: {
    morning: "#CCFBF1",
    day: "#99F6E4",
    afternoon: "#5EEAD4",
    night: "#0F766E",
  },
  violet: {
    morning: "#F3E8FF",
    day: "#DDD6FE",
    afternoon: "#C4B5FD",
    night: "#7C3AED",
  },
};

export interface PaletteOption {
  disabled: boolean;
  name: ColorPaletteName;
}

interface ColorPalettePickerProps {
  /** Currently selected palette name (controlled) */
  value?: string;
  /** Called when the user clicks a palette card */
  onChange?: (paletteName: ColorPaletteName) => void;
  /** The input name attribute for form submission */
  name?: string;
  /** Palette options with availability info */
  paletteOptions: PaletteOption[];
  /** Optional error message */
  error?: string;
  /** Id of the hidden input (for label htmlFor linkage) */
  id?: string;
}

export function ColorPalettePicker({
  value,
  onChange,
  name = "colorPalette",
  paletteOptions,
  error,
  id,
}: ColorPalettePickerProps) {
  return (
    <div>
      <input id={id} name={name} type="hidden" value={value ?? ""} />

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        role="radiogroup"
        aria-label="Paleta de color"
      >
        {paletteOptions.map((option) => {
          const isSelected = value === option.name;
          const tones = PALETTE_TONES[option.name];

          return (
            <button
              key={option.name}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={option.disabled}
              disabled={option.disabled}
              onClick={() => !option.disabled && onChange?.(option.name)}
              className={[
                "rounded-2xl border-2 p-3 text-left transition-all",
                option.disabled
                  ? "cursor-not-allowed border-stone-200 bg-stone-50 opacity-50"
                  : isSelected
                    ? "border-slate-700 bg-white shadow-md"
                    : "cursor-pointer border-stone-200 bg-white hover:border-slate-400 hover:shadow-sm",
              ].join(" ")}
            >
              {/* Shift tone swatches */}
              <div className="mb-2 flex h-6 overflow-hidden rounded-lg">
                {TONE_KEYS.map((tone) => (
                  <div
                    key={tone}
                    className="flex-1"
                    style={{ backgroundColor: tones[tone] }}
                    aria-label={tone}
                  />
                ))}
              </div>

              {/* Palette name */}
              <p className="text-xs font-semibold text-slate-800">
                {PALETTE_LABELS[option.name]}
              </p>

              {option.disabled ? (
                <p className="text-[10px] text-slate-500">Ocupada</p>
              ) : isSelected ? (
                <p className="text-[10px] font-medium text-slate-700">
                  Seleccionada
                </p>
              ) : null}
            </button>
          );
        })}
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
