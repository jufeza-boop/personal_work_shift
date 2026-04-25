export interface ProfileFormState {
  errors?: Record<string, string | undefined>;
  message?: string;
  success: boolean;
}

export const EMPTY_PROFILE_FORM_STATE: ProfileFormState = { success: false };
