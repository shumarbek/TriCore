import type { LessonAdminData } from "@/lib/data/admin-lessons";
import type { LessonHandbook } from "@/lib/data/handbook";

export interface LessonContentOverride {
  lesson_id: string;
  title: string;
  subject_id?: string;
  subject_name?: string;
  section_id?: string;
  section_name?: string;
  sub_section_id?: string;
  sub_section_name?: string;
  order_index?: number;
  video_url: string;
  handbook_rules: string;
  handbook_terms: string;
  formulas: string;
  mini_exam_count: number;
  homework_pdf: string;
  homework_deadline: string;
}

export interface LessonVideoInfo {
  provider: "youtube" | "odysee" | "unknown";
  embedUrl: string | null;
}

function buildYouTubeEmbedUrl(id: string, startSeconds?: string | null) {
  const params = new URLSearchParams({
    rel: "0",
    controls: "1",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
  });
  if (typeof window !== "undefined") {
    params.set("origin", window.location.origin);
  }
  if (startSeconds) params.set("start", startSeconds);
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function parseYouTubeStartSeconds(value?: string | null) {
  if (!value) return null;
  if (/^\d+$/.test(value)) return value;

  const match = value.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i);
  if (!match) return null;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const total = hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? String(total) : null;
}

export function toLessonContentOverride(lesson: LessonAdminData): LessonContentOverride {
  return {
    lesson_id: lesson.id,
    title: lesson.title,
    subject_id: lesson.subjectId,
    subject_name: lesson.subjectName,
    section_id: lesson.sectionId,
    section_name: lesson.sectionName,
    sub_section_id: lesson.subSectionId,
    sub_section_name: lesson.subSectionName,
    order_index: lesson.order,
    video_url: lesson.videoUrl,
    handbook_rules: lesson.handbookRules,
    handbook_terms: lesson.handbookTerms,
    formulas: lesson.formulas,
    mini_exam_count: lesson.miniExamCount,
    homework_pdf: lesson.homeworkPdf,
    homework_deadline: lesson.homeworkDeadline,
  };
}

export function applyLessonOverride<T extends { lesson: { title: string } }>(
  meta: T,
  override?: LessonContentOverride | null
) {
  if (!override) return meta;
  return {
    ...meta,
    lesson: {
      ...meta.lesson,
      title: override.title || meta.lesson.title,
    },
  };
}

export function buildHandbookFromOverride(
  lessonId: string,
  fallback: LessonHandbook,
  override?: LessonContentOverride | null
): LessonHandbook {
  if (!override) return fallback;
  const rules = override.handbook_rules
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      title: `Qoida ${index + 1}`,
      content: line,
    }));
  const terms = override.handbook_terms
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [term, ...definition] = line.split("|");
      return {
        term: term?.trim() || "Atama",
        definition: definition.join("|").trim() || "Ta'rif kiritilmagan",
      };
    });

  return {
    lessonId,
    rules: rules.length ? rules : fallback.rules,
    terms: terms.length ? terms : fallback.terms,
  };
}

export function buildFormulaList(
  override?: LessonContentOverride | null
): Array<{ name: string; expr: string }> {
  const lines = (override?.formulas || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) {
    return [
      { name: "Asosiy formula", expr: "F = ma" },
      { name: "Yordamchi", expr: "v = s / t" },
    ];
  }
  return lines.map((expr, index) => ({ name: `Formula ${index + 1}`, expr }));
}

export function getVideoInfo(url?: string | null): LessonVideoInfo {
  if (!url) return { provider: "unknown", embedUrl: null };

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const startSeconds =
      parseYouTubeStartSeconds(parsed.searchParams.get("t")) ||
      parseYouTubeStartSeconds(parsed.searchParams.get("start"));

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id =
        parsed.searchParams.get("v") ||
        (pathParts[0] === "shorts" ? pathParts[1] : null) ||
        (pathParts[0] === "live" ? pathParts[1] : null) ||
        (pathParts[0] === "embed" ? pathParts[1] : null);
      return {
        provider: "youtube",
        embedUrl: id ? buildYouTubeEmbedUrl(id, startSeconds) : null,
      };
    }

    if (host === "youtu.be") {
      const id = pathParts[0] || "";
      return {
        provider: "youtube",
        embedUrl: id ? buildYouTubeEmbedUrl(id, startSeconds) : null,
      };
    }

    if (host === "odysee.com") {
      const path = parsed.pathname.replace(/^\//, "");
      return {
        provider: "odysee",
        embedUrl: path ? `https://odysee.com/$/embed/${path}` : null,
      };
    }
  } catch {}

  return { provider: "unknown", embedUrl: null };
}

export function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return null;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
