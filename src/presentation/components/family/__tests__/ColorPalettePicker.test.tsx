import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { PaletteOption } from "@/presentation/components/family/ColorPalettePicker";
import { ColorPalettePicker } from "@/presentation/components/family/ColorPalettePicker";

const ALL_PALETTES: PaletteOption[] = [
  { disabled: false, name: "sky" },
  { disabled: false, name: "rose" },
  { disabled: true, name: "violet" },
];

describe("ColorPalettePicker", () => {
  it("renders a card for each palette option", () => {
    render(
      <ColorPalettePicker paletteOptions={ALL_PALETTES} name="colorPalette" />,
    );

    expect(screen.getByText("Cielo")).toBeInTheDocument();
    expect(screen.getByText("Rosa")).toBeInTheDocument();
    expect(screen.getByText("Violeta")).toBeInTheDocument();
  });

  it("marks disabled palettes with 'Ocupada' and disables their button", () => {
    render(
      <ColorPalettePicker paletteOptions={ALL_PALETTES} name="colorPalette" />,
    );

    expect(screen.getByText("Ocupada")).toBeInTheDocument();
    const violetButton = screen.getByRole("radio", { name: /violeta/i });
    expect(violetButton).toBeDisabled();
  });

  it("calls onChange with the palette name when an available card is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <ColorPalettePicker
        paletteOptions={ALL_PALETTES}
        name="colorPalette"
        onChange={handleChange}
      />,
    );

    await user.click(screen.getByRole("radio", { name: /cielo/i }));
    expect(handleChange).toHaveBeenCalledWith("sky");
  });

  it("does not call onChange when a disabled palette card is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <ColorPalettePicker
        paletteOptions={ALL_PALETTES}
        name="colorPalette"
        onChange={handleChange}
      />,
    );

    const violetButton = screen.getByRole("radio", { name: /violeta/i });
    await user.click(violetButton);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("marks the selected palette as aria-checked=true", () => {
    render(
      <ColorPalettePicker
        paletteOptions={ALL_PALETTES}
        name="colorPalette"
        value="rose"
      />,
    );

    const roseButton = screen.getByRole("radio", { name: /rosa/i });
    expect(roseButton).toHaveAttribute("aria-checked", "true");
  });

  it("shows the 'Seleccionada' label on the active palette card", () => {
    render(
      <ColorPalettePicker
        paletteOptions={ALL_PALETTES}
        name="colorPalette"
        value="sky"
      />,
    );

    expect(screen.getByText("Seleccionada")).toBeInTheDocument();
  });

  it("renders a hidden input with the selected value", () => {
    render(
      <ColorPalettePicker
        paletteOptions={ALL_PALETTES}
        name="colorPalette"
        value="rose"
        id="palette-input"
      />,
    );

    const input = document.getElementById(
      "palette-input",
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input?.value).toBe("rose");
  });

  it("renders 4 shift tone swatches inside each card", () => {
    render(
      <ColorPalettePicker
        paletteOptions={[{ disabled: false, name: "sky" }]}
        name="colorPalette"
      />,
    );

    // 4 tone divs have aria-label attributes: morning, day, afternoon, night
    expect(screen.getByLabelText("morning")).toBeInTheDocument();
    expect(screen.getByLabelText("day")).toBeInTheDocument();
    expect(screen.getByLabelText("afternoon")).toBeInTheDocument();
    expect(screen.getByLabelText("night")).toBeInTheDocument();
  });

  it("displays an error message when the error prop is provided", () => {
    render(
      <ColorPalettePicker
        paletteOptions={ALL_PALETTES}
        name="colorPalette"
        error="Selecciona una paleta válida."
      />,
    );

    expect(
      screen.getByText("Selecciona una paleta válida."),
    ).toBeInTheDocument();
  });
});
