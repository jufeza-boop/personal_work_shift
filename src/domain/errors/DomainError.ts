export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {}

export class EventOwnershipError extends DomainError {
  constructor() {
    super(
      "Only the event creator or an authorized delegated user can manage this event",
    );
  }
}

export class ColorPaletteAlreadyTakenError extends DomainError {
  constructor(paletteName: string) {
    super(`Color palette ${paletteName} is already assigned in this family`);
  }
}
