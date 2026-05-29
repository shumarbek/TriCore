import { getAllLessons } from "./curriculum";

export interface LessonAdminData {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  sectionId: string;
  sectionName: string;
  subSectionId: string;
  subSectionName: string;
  order: number;
  videoUrl: string;
  handbookRules: string;
  handbookTerms: string;
  formulas: string;
  miniExamCount: number;
  homeworkPdf: string;
  homeworkDeadline: string;
}

const defaults = (lesson: ReturnType<typeof getAllLessons>[0]): LessonAdminData => ({
  id: lesson.id,
  title: lesson.title,
  subjectId: lesson.subjectId,
  subjectName: lesson.subjectName,
  sectionId: lesson.sectionId,
  sectionName: lesson.sectionName,
  subSectionId: lesson.subSectionId,
  subSectionName: lesson.subSectionName,
  order: lesson.order,
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  handbookRules: "1. Birliklarni SI tizimida yozing.\n2. Har bosqichni alohida qatorga ajrating.",
  handbookTerms: "Asosiy atama|Ta'rif satri",
  formulas: "F = ma\nv = s / t",
  miniExamCount: 10,
  homeworkPdf: "",
  homeworkDeadline: "",
});

export function getAdminLessons(): LessonAdminData[] {
  return getAllLessons().map((l) => defaults(l));
}

export function getAdminLessonStats() {
  const lessons = getAllLessons();
  const subjects = new Set(lessons.map((l) => l.subjectId));
  const sections = new Set(lessons.map((l) => `${l.subjectId}-${l.sectionName}`));
  return {
    subjects: subjects.size,
    sections: sections.size,
    lessons: lessons.length,
  };
}
