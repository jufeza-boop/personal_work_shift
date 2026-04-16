export interface FamilyFormState {
  errors?: {
    colorPalette?: string;
    displayName?: string;
    email?: string;
    name?: string;
  };
  message?: string;
  success: boolean;
}

export const EMPTY_FAMILY_FORM_STATE: FamilyFormState = {
  success: false,
};

export type FamilyFormAction = (
  previousState: FamilyFormState,
  formData: FormData,
) => Promise<FamilyFormState>;
