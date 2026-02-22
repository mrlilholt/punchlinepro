interface ParsedQuestionAnswerJoke {
  is_question_answer_based: boolean;
  question_setup: string | null;
  trailing_text: string | null;
}

function normalize_whitespace(raw_text: string): string {
  return raw_text.replace(/\s+/g, ' ').trim();
}

export function parse_question_answer_joke_text(
  raw_text: string,
): ParsedQuestionAnswerJoke {
  const normalized_text = normalize_whitespace(raw_text);

  if (!normalized_text) {
    return {
      is_question_answer_based: false,
      question_setup: null,
      trailing_text: null,
    };
  }

  const question_mark_index = normalized_text.indexOf('?');

  if (question_mark_index === -1) {
    return {
      is_question_answer_based: false,
      question_setup: null,
      trailing_text: null,
    };
  }

  const question_setup = normalized_text.slice(0, question_mark_index + 1).trim();
  const trailing_text =
    normalized_text.slice(question_mark_index + 1).trim() || null;

  return {
    is_question_answer_based: true,
    question_setup,
    trailing_text,
  };
}
