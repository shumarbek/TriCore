export interface ExamQuestion {
  id: string;
  subjectId: string;
  sectionId: string;
  subSectionId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const examQuestions: ExamQuestion[] = [
  {
    id: "eq1",
    subjectId: "physics",
    sectionId: "molekulyar-termodinamika",
    subSectionId: "molekulyar-asoslari",
    question: "Ideal gaz uchun asosiy tenglama qaysi?",
    options: ["pV = νRT", "F = ma", "E = mc²", "V = IR"],
    correctIndex: 0,
    explanation: "Ideal gaz uchun pV = νRT — MKN asosiy tenglama.",
  },
  {
    id: "eq2",
    subjectId: "physics",
    sectionId: "molekulyar-termodinamika",
    subSectionId: "molekulyar-asoslari",
    question: "R universal gaz doimiysi qiymati (J/(mol·K))?",
    options: ["8.31", "9.8", "6.02·10²³", "1.6·10⁻¹⁹"],
    correctIndex: 0,
    explanation: "R ≈ 8.31 J/(mol·K).",
  },
  {
    id: "eq3",
    subjectId: "mathematics",
    sectionId: "geometriya",
    subSectionId: "planimetriya",
    question: "To'g'ri burchakli uchburchakda gipotenuza c, katetlar a va b bo'lsa:",
    options: ["a + b = c", "a² + b² = c²", "a · b = c", "a / b = c"],
    correctIndex: 1,
    explanation: "Pifagor teoremasi: a² + b² = c².",
  },
];

export function getQuestionsForSubSection(
  subjectId: string,
  sectionId: string,
  subSectionId: string
) {
  return examQuestions.filter(
    (q) =>
      q.subjectId === subjectId &&
      q.sectionId === sectionId &&
      q.subSectionId === subSectionId
  );
}
