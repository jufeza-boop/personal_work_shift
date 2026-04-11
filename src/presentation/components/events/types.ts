export interface EventFormState {
  errors?: {
    category?: string;
    date?: string;
    description?: string;
    endDate?: string;
    endTime?: string;
    frequencyInterval?: string;
    frequencyUnit?: string;
    shiftType?: string;
    startDate?: string;
    startTime?: string;
    title?: string;
  };
  message?: string;
  success: boolean;
}

export const EMPTY_EVENT_FORM_STATE: EventFormState = { success: false };

export type EventFormAction = (
  previousState: EventFormState,
  formData: FormData,
) => Promise<EventFormState>;
