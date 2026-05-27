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
            subSectionId: sub.id,
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
          sectionId: section.id,
          sectionName: section.name,
          subSectionId: sub.id,
          subSectionName: sub.name,
        }))
      )
    )
  );
}

export function getLessonsBySubject(subjectId: string) {
  return getAllLessons().filter((l) => l.subjectId === subjectId);
}

export function getAdjacentLessons(lessonId: string) {
  const lessons = getAllLessons();
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) {
    return { previous: null, next: null };
  }
  return {
    previous: index > 0 ? lessons[index - 1] : null,
    next: index < lessons.length - 1 ? lessons[index + 1] : null,
  };
}

/** Har bir fan uchun userning hozir o'rganib yetib kelgan (in_progress yoki birinchi available) darsini qaytaradi */
export function getCurrentLessonPerSubject() {
  return curricula.map((subject) => {
    for (const section of subject.sections) {
      for (const sub of section.subSections) {
        const inProgress = sub.lessons.find((l) => l.status === "in_progress");
        if (inProgress) {
          return {
            subjectId: subject.id,
            subjectName: subject.name,
            subjectIcon: subject.id === "mathematics" ? "\u2211" : subject.id === "physics" ? "\u269B" : "\u2697",
            lessonId: inProgress.id,
            lessonTitle: inProgress.title,
            sectionName: section.name,
            subSectionName: sub.name,
          };
        }
      }
    }
    // Agar in_progress topilmasa, birinchi available darsni qaytaradi
    for (const section of subject.sections) {
      for (const sub of section.subSections) {
        const available = sub.lessons.find((l) => l.status === "available");
        if (available) {
          return {
            subjectId: subject.id,
            subjectName: subject.name,
            subjectIcon: subject.id === "mathematics" ? "\u2211" : subject.id === "physics" ? "\u269B" : "\u2697",
            lessonId: available.id,
            lessonTitle: available.title,
            sectionName: section.name,
            subSectionName: sub.name,
          };
        }
      }
    }
    // Hech narsa topilmasa — barcha darslar completed yoki locked
    const firstLesson = subject.sections[0]?.subSections[0]?.lessons[0];
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectIcon: subject.id === "mathematics" ? "\u2211" : subject.id === "physics" ? "\u269B" : "\u2697",
      lessonId: firstLesson?.id ?? "",
      lessonTitle: firstLesson?.title ?? "—",
      sectionName: subject.sections[0]?.name ?? "",
      subSectionName: subject.sections[0]?.subSections[0]?.name ?? "",
    };
  });
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
