export interface MiniExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

function normalizeQuestion(raw: unknown, index: number): MiniExamQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as {
    id?: unknown;
    question?: unknown;
    options?: unknown;
    correctIndex?: unknown;
  };
  const question = typeof candidate.question === "string" ? candidate.question.trim() : "";
  const options = Array.isArray(candidate.options)
    ? candidate.options.map((option) => (typeof option === "string" ? option.trim() : "")).filter(Boolean)
    : [];
  const correctIndex =
    typeof candidate.correctIndex === "number" && Number.isInteger(candidate.correctIndex)
      ? candidate.correctIndex
      : 0;

  if (!question || options.length < 2 || correctIndex < 0 || correctIndex >= options.length) {
    return null;
  }

  return {
    id:
      typeof candidate.id === "string" && candidate.id.trim()
        ? candidate.id
        : `mini-exam-${index + 1}`,
    question,
    options,
    correctIndex,
  };
}

export function parseMiniExamQuestions(value?: string | null): MiniExamQuestion[] {
  if (!value?.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item, index) => normalizeQuestion(item, index))
      .filter((item): item is MiniExamQuestion => Boolean(item));
  } catch {
    return [];
  }
}

export function stringifyMiniExamQuestions(questions: MiniExamQuestion[]) {
  return JSON.stringify(
    questions.map((question) => ({
      id: question.id,
      question: question.question.trim(),
      options: question.options.map((option) => option.trim()).filter(Boolean),
      correctIndex: question.correctIndex,
    }))
  );
}

export function createEmptyMiniExamQuestion(seed = Date.now()): MiniExamQuestion {
  return {
    id: `mini-exam-${seed}`,
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
  };
}
