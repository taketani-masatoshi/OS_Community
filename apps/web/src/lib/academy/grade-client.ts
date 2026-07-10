export type GradeAnswerInput = {
  item_id: string;
  choice_id?: string;
  answer?: string | boolean;
};

export type GradeItemResult = {
  item_id: string;
  correct: boolean;
  selected_choice_id?: string;
  correct_choice_id?: string;
  explanation: string;
};

export type GradeExamResponse = {
  bank_id: string;
  form_id: string;
  score: number;
  pass_score: number;
  pass: boolean;
  total_items: number;
  correct_count: number;
  items: GradeItemResult[];
};

export type GradeExamRequest = {
  bankId: string;
  formId: string;
  answers: GradeAnswerInput[];
};

export function getInternalGradeUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/internal/v1/exams/grade`;
}

export async function gradeExamViaContentApi(
  baseUrl: string,
  token: string,
  request: GradeExamRequest,
): Promise<GradeExamResponse> {
  const res = await fetch(getInternalGradeUrl(baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Internal-Token": token,
    },
    body: JSON.stringify({
      bank_id: request.bankId,
      form_id: request.formId,
      answers: request.answers,
    }),
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      message = body.error?.message ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const body = (await res.json()) as { result: GradeExamResponse };
  return body.result;
}
