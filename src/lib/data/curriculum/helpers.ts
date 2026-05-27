import type {
  CurriculumLesson,
  LessonStatus,
  SectionHomeworkItem,
  SubjectCurriculum,
} from "./types";

export function buildLessons(
  prefix: string,
  titles: string[],
  completedCount = 2
): CurriculumLesson[] {
  return titles.map((title, i) => {
    let status: LessonStatus = "locked";
    if (completedCount <= 0) {
      status = i === 0 ? "available" : "locked";
    } else if (i < completedCount) status = "completed";
    else if (i === completedCount) status = "in_progress";
    else if (i === completedCount + 1) status = "available";

    return {
      id: `${prefix}-${i + 1}`,
      title: `${i + 1}. ${title}`,
      order: i + 1,
      status,
    };
  });
}

export function getSectionHomeworkItems(
  curricula: SubjectCurriculum[]
): SectionHomeworkItem[] {
  const items: SectionHomeworkItem[] = [];

  for (const subject of curricula) {
    for (const section of subject.sections) {
      let last: { lesson: CurriculumLesson; subSectionName: string } | null = null;

      for (const sub of section.subSections) {
        for (const lesson of sub.lessons) {
          if (lesson.status === "completed") {
            last = { lesson, subSectionName: sub.name };
          }
        }
      }

      if (!last) continue;

      items.push({
        id: `hw-${last.lesson.id}`,
        subjectId: subject.id,
        subjectName: subject.name,
        sectionId: section.id,
        sectionName: section.name,
        lessonId: last.lesson.id,
        lessonTitle: last.lesson.title,
        title: `${section.name} — oxirgi o'tilgan dars uy vazifasi`,
        deadline: "May 28, 2026",
        status: section.order % 2 === 0 ? "pending" : "submitted",
      });
    }
  }

  return items;
}
