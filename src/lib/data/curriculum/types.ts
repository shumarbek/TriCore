export type LessonStatus = "completed" | "in_progress" | "available" | "locked";

export interface CurriculumLesson {
  id: string;
  title: string;
  order: number;
  status: LessonStatus;
}

export interface SubSection {
  id: string;
  name: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumSection {
  id: string;
  name: string;
  order: number;
  subSections: SubSection[];
}

export interface SubjectCurriculum {
  id: string;
  name: string;
  sections: CurriculumSection[];
}

export interface SectionHomeworkItem {
  id: string;
  subjectId: string;
  subjectName: string;
  sectionId: string;
  sectionName: string;
  lessonId: string;
  lessonTitle: string;
  title: string;
  deadline: string;
  status: "pending" | "submitted" | "graded";
  score?: number;
}
