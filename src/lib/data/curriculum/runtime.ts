import { chemistryCurriculum } from "./chemistry";
import { mathematicsCurriculum } from "./math";
import { physicsCurriculum } from "./physics";
import type {
  CurriculumLesson,
  CurriculumSection,
  SubjectCurriculum,
  SubSection,
} from "./types";
import type { LessonContentOverride } from "@/lib/lesson-content";

export type CurriculumStructureNode = {
  node_id: string;
  node_type: "section" | "sub_section";
  subject_id: string;
  parent_section_id: string | null;
  name: string;
  order_index: number;
  is_deleted: boolean;
};

export function getBaseCurricula(): SubjectCurriculum[] {
  return [mathematicsCurriculum, physicsCurriculum, chemistryCurriculum];
}

function cloneLesson(lesson: CurriculumLesson): CurriculumLesson {
  return { ...lesson };
}

function cloneSubSection(subSection: SubSection): SubSection {
  return {
    ...subSection,
    lessons: subSection.lessons.map(cloneLesson),
  };
}

function cloneSection(section: CurriculumSection): CurriculumSection {
  return {
    ...section,
    subSections: section.subSections.map(cloneSubSection),
  };
}

export function buildRuntimeCurricula(
  structureRows: CurriculumStructureNode[],
  lessonRows: LessonContentOverride[] = []
): SubjectCurriculum[] {
  const sectionRows = structureRows.filter((row) => row.node_type === "section");
  const subSectionRows = structureRows.filter((row) => row.node_type === "sub_section");

  return getBaseCurricula().map((subject) => {
    const subjectSections = sectionRows.filter((row) => row.subject_id === subject.id);
    const runtimeSections = subject.sections
      .map((section) => {
        const override = subjectSections.find((row) => row.node_id === section.id);
        if (override?.is_deleted) return null;

        const subRows = subSectionRows.filter(
          (row) => row.subject_id === subject.id && row.parent_section_id === section.id
        );

        const subSections = section.subSections
          .map((subSection) => {
            const subOverride = subRows.find((row) => row.node_id === subSection.id);
            if (subOverride?.is_deleted) return null;
            return {
              ...cloneSubSection(subSection),
              name: subOverride?.name || subSection.name,
              lessons: [
                ...subSection.lessons.map((lesson) => {
                  const lessonOverride = lessonRows.find((row) => row.lesson_id === lesson.id);
                  return {
                    ...cloneLesson(lesson),
                    title: lessonOverride?.title || lesson.title,
                    order: lessonOverride?.order_index ?? lesson.order,
                  };
                }),
                ...lessonRows
                  .filter(
                    (row) =>
                      row.subject_id === subject.id &&
                      row.section_id === section.id &&
                      row.sub_section_id === subSection.id &&
                      !subSection.lessons.some((lesson) => lesson.id === row.lesson_id)
                  )
                  .map((row) => ({
                    id: row.lesson_id,
                    title: row.title,
                    order: row.order_index ?? 999,
                    status: "available" as const,
                  })),
              ].sort((a, b) => a.order - b.order),
            };
          })
          .filter(Boolean) as SubSection[];

        const customSubSections = subRows
          .filter(
            (row) => !row.is_deleted && !section.subSections.some((subSection) => subSection.id === row.node_id)
          )
          .map((row) => ({
            id: row.node_id,
            name: row.name,
            lessons: lessonRows
              .filter(
                (lesson) =>
                  lesson.subject_id === subject.id &&
                  lesson.section_id === section.id &&
                  lesson.sub_section_id === row.node_id
              )
              .map((lesson) => ({
                id: lesson.lesson_id,
                title: lesson.title,
                order: lesson.order_index ?? 999,
                status: "available" as const,
              }))
              .sort((a, b) => a.order - b.order),
          }));

        return {
          ...cloneSection(section),
          name: override?.name || section.name,
          order: override?.order_index ?? section.order,
          subSections: [...subSections, ...customSubSections].sort((a, b) =>
            a.name.localeCompare(b.name)
          ),
        };
      })
      .filter(Boolean) as CurriculumSection[];

    const customSections = subjectSections
      .filter((row) => !row.is_deleted && !subject.sections.some((section) => section.id === row.node_id))
      .map((row) => ({
        id: row.node_id,
        name: row.name,
        order: row.order_index,
        subSections: subSectionRows
          .filter(
            (subRow) =>
              !subRow.is_deleted &&
              subRow.subject_id === subject.id &&
              subRow.parent_section_id === row.node_id
          )
          .map((subRow) => ({
            id: subRow.node_id,
            name: subRow.name,
            lessons: lessonRows
              .filter(
                (lesson) =>
                  lesson.subject_id === subject.id &&
                  lesson.section_id === row.node_id &&
                  lesson.sub_section_id === subRow.node_id
              )
              .map((lesson) => ({
                id: lesson.lesson_id,
                title: lesson.title,
                order: lesson.order_index ?? 999,
                status: "available" as const,
              }))
              .sort((a, b) => a.order - b.order),
          })),
      }));

    return {
      ...subject,
      sections: [...runtimeSections, ...customSections].sort((a, b) => a.order - b.order),
    };
  });
}

export function getRuntimeSections(curricula: SubjectCurriculum[], subjectId: string) {
  return (
    curricula
      .find((subject) => subject.id === subjectId)
      ?.sections.map((section) => ({ id: section.id, name: section.name })) ?? []
  );
}

export function getRuntimeSubSections(
  curricula: SubjectCurriculum[],
  subjectId: string,
  sectionId: string
) {
  return (
    curricula
      .find((subject) => subject.id === subjectId)
      ?.sections.find((section) => section.id === sectionId)
      ?.subSections.map((subSection) => ({ id: subSection.id, name: subSection.name })) ?? []
  );
}

export function findRuntimeLessonById(curricula: SubjectCurriculum[], lessonId: string) {
  for (const subject of curricula) {
    for (const section of subject.sections) {
      for (const subSection of section.subSections) {
        const lesson = subSection.lessons.find((item) => item.id === lessonId);
        if (lesson) {
          return {
            lesson,
            subjectId: subject.id,
            subjectName: subject.name,
            sectionId: section.id,
            sectionName: section.name,
            subSectionId: subSection.id,
            subSectionName: subSection.name,
          };
        }
      }
    }
  }
  return null;
}

export function getRuntimeLessonGroup(curricula: SubjectCurriculum[], lessonId: string) {
  const meta = findRuntimeLessonById(curricula, lessonId);
  if (!meta) return [];
  return (
    curricula
      .find((subject) => subject.id === meta.subjectId)
      ?.sections.find((section) => section.id === meta.sectionId)
      ?.subSections.find((subSection) => subSection.id === meta.subSectionId)
      ?.lessons ?? []
  );
}

export function getRuntimeExamScopeLabel(
  curricula: SubjectCurriculum[],
  subjectId: string,
  sectionId: string,
  subSectionId: string
) {
  const subject = curricula.find((item) => item.id === subjectId);
  const section = subject?.sections.find((item) => item.id === sectionId);
  if (!section) return "";
  if (subSectionId === "all") return `${section.name} - barcha sub-section mavzulari`;
  const subSection = section.subSections.find((item) => item.id === subSectionId);
  return subSection ? `${section.name} -> ${subSection.name}` : section.name;
}
