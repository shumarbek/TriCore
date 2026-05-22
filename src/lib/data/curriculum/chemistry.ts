import type { SubjectCurriculum } from "./types";
import { buildLessons } from "./helpers";

export const chemistryCurriculum: SubjectCurriculum = {
  id: "chemistry",
  name: "Kimyo",
  sections: [
    {
      id: "umumiy-kimyo",
      name: "Umumiy kimyo",
      order: 1,
      subSections: [
        {
          id: "atom-molekula",
          name: "Atom va molekula",
          lessons: buildLessons("chem-umum", [
            "Atomlar tuzilishi",
            "Molekulalar",
            "Davriy jadval",
            "Kimyoviy bog'lanishlar",
          ], 2),
        },
      ],
    },
    {
      id: "anorganik",
      name: "Anorganik kimyo",
      order: 2,
      subSections: [
        {
          id: "anorganik-asoslari",
          name: "Anorganik kimyo mavzulari",
          lessons: buildLessons("chem-anorg", [
            "Kislotalar",
            "Asoslar",
            "Tuzlar",
            "Metallar",
          ], 0),
        },
      ],
    },
    {
      id: "organik",
      name: "Organik kimyo",
      order: 3,
      subSections: [
        {
          id: "organik-asoslari",
          name: "Organik kimyo mavzulari",
          lessons: buildLessons("chem-org", [
            "Uglevodorodlar",
            "Spirtlar",
            "Polimerlar",
          ], 0),
        },
      ],
    },
    {
      id: "fizik-kimyo",
      name: "Fizik kimyo",
      order: 4,
      subSections: [
        {
          id: "fizik-kimyo-asoslari",
          name: "Fizik kimyo mavzulari",
          lessons: buildLessons("chem-fiz", [
            "Termokimyo",
            "Reaksiya tezligi",
            "Muvozanat",
          ], 0),
        },
      ],
    },
  ],
};
