import { chemistryCurriculum } from "./chemistry";
import { getSectionHomeworkItems } from "./helpers";
import { mathematicsCurriculum } from "./math";
import { physicsCurriculum } from "./physics";
import type { SubjectCurriculum } from "./types";

export const curricula: SubjectCurriculum[] = [
  mathematicsCurriculum,
  physicsCurriculum,
  chemistryCurriculum,
];

export function getCurriculum(subjectId: string) {
  return curricula.find((c) => c.id === subjectId);
}

export function getSections(subjectId: string) {
  const curriculum = getCurriculum(subjectId);
  if (!curriculum) return [];
  return curriculum.sections.map((s) => ({ id: s.id, name: s.name }));
}

export function getSubSections(subjectId: string, sectionId: string) {
  const curriculum = getCurriculum(subjectId);
  const section = curriculum?.sections.find((s) => s.id === sectionId);
  if (!section) return [];
  return section.subSections.map((s) => ({ id: s.id, name: s.name }));
}

export function getExamScopeLabel(
  subjectId: string,
  sectionId: string,
  subSectionId: string
) {
  const curriculum = getCurriculum(subjectId);
  const section = curriculum?.sections.find((s) => s.id === sectionId);
  if (!section) return "";
  if (subSectionId === "all") {
    return `${section.name} — barcha sub-section mavzulari`;
  }
  const sub = section.subSections.find((s) => s.id === subSectionId);
  return sub ? `${section.name} → ${sub.name}` : section.name;
}

export function countQuestionsInScope(
  subjectId: string,
  sectionId: string,
  subSectionId: string
) {
  const curriculum = getCurriculum(subjectId);
  const section = curriculum?.sections.find((s) => s.id === sectionId);
  if (!section) return 0;

  if (subSectionId === "all") {
    return section.subSections.reduce((n, sub) => n + sub.lessons.length * 3, 0);
  }
  const sub = section.subSections.find((s) => s.id === subSectionId);
  return sub ? sub.lessons.length * 3 : 0;
}

export const sectionHomeworkItems = getSectionHomeworkItems(curricula);

export function getLessonById(lessonId: string) {
  for (const subject of curricula) {
    for (const section of subject.sections) {
      for (const sub of section.subSections) {
        const lesson = sub.lessons.find((l) => l.id === lessonId);
        if (lesson) {
          return {
            lesson,
            subjectId: subject.id,
            subjectName: subject.name,
            sectionId: section.id,
            sectionName: section.name,
            subSectionName: sub.name,
          };
        }
      }
    }
  }
  return null;
}

export function getAllLessons() {
  return curricula.flatMap((subject) =>
    subject.sections.flatMap((section) =>
      section.subSections.flatMap((sub) =>
        sub.lessons.map((lesson) => ({
          ...lesson,
          subjectId: subject.id,
          subjectName: subject.name,
          sectionName: section.name,
          subSectionName: sub.name,
        }))
      )
    )
  );
}

export type {
  SubjectCurriculum,
  CurriculumSection,
  SubSection,
  CurriculumLesson,
  LessonStatus,
  SectionHomeworkItem,
} from "./types";

export { getSectionHomeworkItems };
