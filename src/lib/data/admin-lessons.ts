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
  miniExamQuestions: string;
  homeworkPdf: string;
  homeworkDeadline: string;
}

export function getAdminLessons(): LessonAdminData[] {
  return [];
}

export function getAdminLessonStats() {
  return {
    subjects: 3,
    sections: 0,
    lessons: 0,
  };
}
