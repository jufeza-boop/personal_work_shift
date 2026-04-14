import type { ColorPaletteName } from "@/domain/value-objects/ColorPalette";
import {
  getPaletteTones,
  SHIFT_TONE_ORDER,
} from "@/presentation/utils/paletteUtils";

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
          const tones = getPaletteTones(option.name);

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
                {SHIFT_TONE_ORDER.map((tone) => (
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
