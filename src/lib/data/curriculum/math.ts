import type { SubjectCurriculum } from "./types";
import { buildLessons } from "./helpers";

const planimetriya = [
  "Burchaklar va masofalar",
  "Parallel to'g'ri chiziqlarda burchaklar",
  "Uchburchakda burchaklar",
  "Uchburchak tengsizligi",
  "To'g'ri burchakli uchburchak",
  "Sinuslar va kosinuslar teoremasi",
  "Uchburchak yuzi. 1-qism",
  "Uchburchak bissektrisasi va uning xossalari",
  "Uchburchak medianasi va uning xossalari",
  "Uchburchaklar o'xshashligi",
  "Uchburchak yuzi. 2-qism",
  "To'rtburchaklar",
  "Parallelogramm va uning xossalari",
  "Romb va uning xossalari",
  "Trapetsiya",
  "Trapetsiya yuzi",
  "Ko'pburchaklar",
  "Aylana va doira",
  "Aylanada burchaklar",
  "Vatar, urinma va kesuvchining xossalari",
  "Uchburchakka ichki chizilgan aylana",
  "Uchburchakka tashqi chizilgan aylana",
  "To'rtburchak va aylana",
  "Trapetsiya va aylana",
  "Ko'pburchak va aylana",
  "Koordinatalar sistemasi",
  "Vektorlar",
  "To'g'ri chiziq va aylana tenglamasi",
  "Aralash bo'lim",
];

const stereometriya = [
  "Fazoda to'g'ri chiziq va tekislik",
  "Kub",
  "To'g'ri burchakli parallelepiped",
  "To'g'ri parallelepiped",
  "Prizma",
  "Piramida",
  "Piramida hajmi va kesik piramida",
  "Silindr",
  "Konus va kesik konus",
  "Shar",
  "Jismlarning kombinatsiyalari. Prizma va shar, prizma va slindr",
  "Jismlarning kombinatsiyalari. Slindr va shar, konus va shar",
  "Jismlarning kombinatsiyalari. Piramida va shar",
  "Eng katta va eng kichik qiymat",
];

export const mathematicsCurriculum: SubjectCurriculum = {
  id: "mathematics",
  name: "Matematika",
  sections: [
    {
      id: "algebra",
      name: "#1 Algebra",
      order: 1,
      subSections: [
        {
          id: "algebra-asoslari",
          name: "Algebra mavzulari",
          lessons: buildLessons("math-alg", [
            "Natural sonlar",
            "Butun sonlar",
            "Kasrlar",
            "Oddiy tenglamalar",
            "Chiziqli tenglamalar",
            "Kvadrat tenglamalar",
            "Funksiyalar va grafiklar",
          ], 3),
        },
      ],
    },
    {
      id: "geometriya",
      name: "#2 Geometriya",
      order: 2,
      subSections: [
        {
          id: "planimetriya",
          name: "Planimetriya",
          lessons: buildLessons("math-geo-plan", planimetriya, 5),
        },
        {
          id: "stereometriya",
          name: "Stereometriya",
          lessons: buildLessons("math-stereo", stereometriya, 0),
        },
      ],
    },
  ],
};
