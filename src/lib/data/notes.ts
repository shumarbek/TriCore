export interface UserNote {
  id: string;
  title: string;
  subject: string;
  lessonId?: string;
  content: string;
  updated: string;
}

export const userNotes: UserNote[] = [
  {
    id: "n1",
    title: "Kvadrat tenglamalar — formulalar",
    subject: "Matematika",
    lessonId: "math-alg-6",
    content: "Diskriminant: Δ = b² - 4ac\nKvadrat formula: x = (-b ± √Δ) / 2a",
    updated: "Bugun",
  },
  {
    id: "n2",
    title: "Nyuton qonunlari xulosasi",
    subject: "Fizika",
    lessonId: "phys-din-1",
    content: "I qonun: F = 0 → a = 0\nII qonun: F = ma\nIII qonun: F₁₂ = -F₂₁",
    updated: "Kecha",
  },
  {
    id: "n3",
    title: "Ideal gaz qonuni",
    subject: "Fizika",
    lessonId: "phys-mol-2",
    content: "pV = νRT\nν — modda miqdori (mol)",
    updated: "3 kun oldin",
  },
  {
    id: "n4",
    title: "Parallelogramm xossalari",
    subject: "Matematika",
    lessonId: "math-geo-plan-13",
    content: "Qarama-qarshi tomonlar teng va parallel\nYuzi: S = a · h",
    updated: "1 hafta oldin",
  },
];
