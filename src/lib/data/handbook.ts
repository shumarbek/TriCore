export interface HandbookRule {
  title: string;
  content: string;
}

export interface HandbookTerm {
  term: string;
  definition: string;
}

export interface LessonHandbook {
  lessonId: string;
  rules: HandbookRule[];
  terms: HandbookTerm[];
}

const defaultHandbook = (lessonId: string, topic: string): LessonHandbook => ({
  lessonId,
  rules: [
    {
      title: "Umumiy qoidalar",
      content: `${topic} bo'yicha masalalarni yechishda birliklarni SI tizimida ifodalang. Javobni mantiqiy tekshiring.`,
    },
    {
      title: "Yozish tartibi",
      content:
        "Har bir bosqichni alohida qatorga yozing. Formulani alohida qatorda, raqamli qiymatlarni esa oxirida ko'rsating.",
    },
  ],
  terms: [
    { term: "Asosiy tushuncha", definition: `${topic} mavzusidagi markaziy fizik/matematik tushuncha.` },
    { term: "Birlik", definition: "O'lchovning xalqaro tizimdagi (SI) standart ko'rinishi." },
  ],
});

const handbooks: Record<string, LessonHandbook> = {
  "math-geo-plan-5": {
    lessonId: "math-geo-plan-5",
    rules: [
      {
        title: "To'g'ri burchakli uchburchak",
        content:
          "Gipotenuza eng uzun tomon. Katetlar kvadratlari yig'indisi gipotenuza kvadratiga teng: a² + b² = c².",
      },
      {
        title: "Yechish tartibi",
        content: "Avval ma'lum va noma'lum tomonlarni belgilang. Keyin Pifagor teoremasini qo'llang.",
      },
    ],
    terms: [
      { term: "Gipotenuza", definition: "To'g'ri burchak qarshisidagi tomon." },
      { term: "Katet", definition: "To'g'ri burchakni hosil qiluvchi tomonlar." },
      { term: "Pifagor teoremasi", definition: "a² + b² = c² (c — gipotenuza)." },
    ],
  },
  "phys-mol-4": {
    lessonId: "phys-mol-4",
    rules: [
      {
        title: "Ideal gaz tenglamasi",
        content: "pV = νRT. R = 8.31 J/(mol·K). T har doim kelvinlarda.",
      },
      {
        title: "Konvertatsiya",
        content: "T(K) = t(°C) + 273. Bosim Pa, hajm m³, ν mol da bo'lishi kerak.",
      },
    ],
    terms: [
      { term: "Ideal gaz", definition: "Molekulalar o'lchamsiz va o'zaro ta'sirsiz deb qabul qilinadi." },
      { term: "ν (nyu)", definition: "Modda miqdori, mol." },
      { term: "R", definition: "Universal gaz doimiysi, 8.31 J/(mol·K)." },
      { term: "Absolut temperatura", definition: "Kelvin shkalasidagi temperatura." },
    ],
  },
  "phys-din-1": {
    lessonId: "phys-din-1",
    rules: [
      {
        title: "Nyuton I qonuni",
        content: "Tashqi kuchlar yig'indisi 0 bo'lsa, jism tinch holatda qoladi yoki TE harakatda davom etadi.",
      },
      {
        title: "Nyuton II qonuni",
        content: "F = ma. F — netto kuch (N), m — massa (kg), a — tezlanish (m/s²).",
      },
    ],
    terms: [
      { term: "Inersiya", definition: "Jism harakat holatini saqlab qolish xossasi." },
      { term: "Netto kuch", definition: "Barcha kuchlar vektor yig'indisi." },
      { term: "Tezlanish", definition: "Tezlikning vaqt bo'yicha o'zgarish tezligi." },
    ],
  },
};

export function getLessonHandbook(
  lessonId: string,
  lessonTitle?: string
): LessonHandbook {
  if (handbooks[lessonId]) return handbooks[lessonId];
  const topic = lessonTitle?.replace(/^\d+\.\s*/, "") ?? "Dars";
  return defaultHandbook(lessonId, topic);
}
