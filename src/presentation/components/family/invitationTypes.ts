export interface InvitationFormState {
  errors?: {
    colorPalette?: string;
    token?: string;
  };
  invitationUrl?: string;
  message?: string;
  success: boolean;
}

export const EMPTY_INVITATION_FORM_STATE: InvitationFormState = {
  success: false,
};

export type InvitationFormAction = (
  previousState: InvitationFormState,
  formData: FormData,
) => Promise<InvitationFormState>;
