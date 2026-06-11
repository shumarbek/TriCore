import { chemistryCurriculum } from "./chemistry";
import { mathematicsCurriculum } from "./math";
import { physicsCurriculum } from "./physics";
import type { CurriculumSection, SubjectCurriculum, SubSection } from "./types";
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
  return [mathematicsCurriculum, physicsCurriculum, chemistryCurriculum].map((subject) => ({
    id: subject.id,
    name: subject.name,
    sections: [],
  }));
}

export function buildRuntimeCurricula(
  structureRows: CurriculumStructureNode[],
  lessonRows: LessonContentOverride[] = []
): SubjectCurriculum[] {
  const sectionRows = structureRows
    .filter((row) => row.node_type === "section" && !row.is_deleted)
    .sort((a, b) => a.order_index - b.order_index);
  const subSectionRows = structureRows
    .filter((row) => row.node_type === "sub_section" && !row.is_deleted)
    .sort((a, b) => a.order_index - b.order_index);

  return getBaseCurricula().map((subject) => {
    const explicitSubjectSections = sectionRows.filter((row) => row.subject_id === subject.id);
    const inferredSubjectSections = lessonRows
      .filter((row) => row.subject_id === subject.id && row.section_id)
      .reduce<CurriculumStructureNode[]>((acc, row) => {
        const sectionId = row.section_id ?? "";
        if (!sectionId) return acc;
        if (explicitSubjectSections.some((section) => section.node_id === sectionId)) return acc;
        if (acc.some((section) => section.node_id === sectionId)) return acc;
        acc.push({
          node_id: sectionId,
          node_type: "section",
          subject_id: subject.id,
          parent_section_id: "",
          name: row.section_name || sectionId,
          order_index: row.order_index ?? 999,
          is_deleted: false,
        });
        return acc;
      }, []);

    const sections = [...explicitSubjectSections, ...inferredSubjectSections]
      .sort((a, b) => a.order_index - b.order_index)
      .map<CurriculumSection>((row) => ({
        id: row.node_id,
        name: row.name,
        order: row.order_index,
        subSections: [
          ...subSectionRows.filter(
            (subRow) => subRow.subject_id === subject.id && subRow.parent_section_id === row.node_id
          ),
          ...lessonRows
            .filter(
              (lesson) =>
                lesson.subject_id === subject.id &&
                lesson.section_id === row.node_id &&
                lesson.sub_section_id &&
                !subSectionRows.some(
                  (subRow) =>
                    subRow.subject_id === subject.id &&
                    subRow.parent_section_id === row.node_id &&
                    subRow.node_id === lesson.sub_section_id
                )
            )
            .reduce<CurriculumStructureNode[]>((acc, lesson) => {
              const subSectionId = lesson.sub_section_id ?? "";
              if (!subSectionId) return acc;
              if (acc.some((subRow) => subRow.node_id === subSectionId)) return acc;
              acc.push({
                node_id: subSectionId,
                node_type: "sub_section",
                subject_id: subject.id,
                parent_section_id: row.node_id,
                name: lesson.sub_section_name || subSectionId,
                order_index: lesson.order_index ?? 999,
                is_deleted: false,
              });
              return acc;
            }, []),
        ]
          .sort((a, b) => a.order_index - b.order_index)
          .map<SubSection>((subRow) => ({
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
      sections,
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
