export interface AuthFormErrors {
  displayName?: string;
  email?: string;
  password?: string;
  token?: string;
  confirmPassword?: string;
}

export interface AuthFormState {
  errors?: AuthFormErrors;
  message?: string;
  success: boolean;
}

export const EMPTY_AUTH_FORM_STATE: AuthFormState = {
  success: false,
};

export type AuthFormAction = (
  state: AuthFormState,
  formData: FormData,
) => Promise<AuthFormState>;
