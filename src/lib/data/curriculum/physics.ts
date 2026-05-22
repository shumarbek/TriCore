import type { SubjectCurriculum } from "./types";
import { buildLessons } from "./helpers";

const boshlangich = [
  "Modda tuzilishi. Tezlik. Yo'l",
  "Massa. Zichlik",
  "Kuch. Kuchlarni qo'shish",
  "Bosim. Paskal qonuni",
  "Gidrostatik bosim",
  "Tutash idishlar",
  "Atmosfera bosimi",
  "Porshenli nasos. Gidravlik press",
  "Arximed kuchi",
  "Jismlarning suzishi. Havoda suzish",
  "Mexanik ish. Quvvat. Richag. Kuch momenti",
  "Blok. Mexanikaning oltin qoidasi",
  "FIK. Potensial va kinetik energiya",
  "Issiqlik o'tkazuvchanlik. Konveksiya. Nurlanish",
  "Issiqlik miqdori. Solishtirma issiqlik sig'imi. Yonish issiqligi",
  "Kristall jismlarning erishi va qotishi",
  "Bug'lanish. Qaynash",
  "Ichki yonuv dvigateli",
  "Elektr hodisalar",
  "Elektr toki. Ampermetr. Kuchlanish. Voltmetr",
  "Om qonuni. Elektr qarshilik",
  "O'tkazgichlarni ketma-ket va parallel ulash",
  "Elektr tokining ishi va quvvati",
  "Joul–Lens qonuni",
  "Elektromagnit hodisalar",
  "Yorug'likning tarqalishi. Qaytishi",
  "Yorug'likning sinishi. Linzalar",
  "Linzalar beradigan tasvirlar",
  "Linzaning optik kuchi",
  "Fotoapparat",
  "Ko'z va ko'rish. Ko'zoynak",
];

const kinematica = [
  "Moddiy nuqta. Ko'chish",
  "To'g'ri chiziqli tekis harakat. Tezlik",
  "Harakatni grafik ravishda tasvirlash",
  "Harakatning nisbiyligi",
  "O'rtacha va oniy tezliklar",
  "Tezlanish. Tekis tezlanuvchan harakat",
  "To'g'ri chiziqli tekis tezlanuvchan harakatda ko'chish",
  "Egri chiziqli harakatda ko'chish va tezlik",
  "Aylana bo'ylab tekis harakatdagi tezlanish",
  "Aylanish davri va chastotasi",
];

const dinamika = [
  "Nyutonning birinchi va ikkinchi qonunlari",
  "Nyutonning uchinchi qonuni",
  "Elastiklik kuchi",
  "Butun olam tortishish kuchi",
  "Og'irlik kuchi",
  "Vazn. Vaznsizlik",
  "Tezlanish bilan harakatlanayotgan jismning vazni",
  "Jismning og'irlik kuchi ta'siridagi vertikal harakati",
  "Jismning og'irlik kuchi ta'siridagi harakati",
  "Yerning sun'iy yo'ldoshlari. Birinchi kosmik tezlik",
  "Ishqalanish kuchi. Tinchlikdagi ishqalanish",
  "Sirpanish ishqalanish kuchi",
  "Ishqalanish kuchi ta'siridagi harakat",
  "Bir necha kuch ta'siridagi harakat",
  "Jismning og'irlik markazi",
  "Statika elementlari",
];

const saqlanish = [
  "Kuch va impuls",
  "Impulsning saqlanish qonuni. Reaktiv harakat",
  "Kuchning ishi",
  "Kinetik energiya",
  "Potensial energiya",
  "Elastiklik kuchining ishi",
  "To'liq mexanik energiyaning saqlanish qonuni",
  "Ishqalanish kuchining ishi va mexanik energiya",
  "Quvvat",
  "Suyuqliklarning naydagi harakati. Bernulli qonuni",
];

const mexTebranish = [
  "Tebranma harakat. Tebranma harakat energiyasi",
  "Prujinali mayatnik",
  "Garmonik tebranishlar tenglamasi",
  "Matematik mayatnik",
  "Ko'ndalang va bo'ylama to'lqinlar",
  "Tovushning xossalari. Tovush hodisalari",
];

const molekulyar = [
  "Molekulalarning massasi. Modda miqdori",
  "Ideal gaz. Gaz MKN ning asosiy tenglamasi",
  "Absolut temperatura. O'rtacha kinetik energiya",
  "Gaz molekulalarining o'rtacha tezligi",
  "Ideal gaz holatining tenglamasi",
  "Gaz qonunlari",
  "To'yingan bug'. Qaynash. Kritik temperatura",
  "Havoning namligi",
  "Kapillarlik hodisalari. Sirt taranglik",
  "Qattiq jismning mexanik xossalari",
];

const termodinamika = [
  "Ichki energiya",
  "Termodinamikada ish",
  "Issiqlik miqdori",
  "Termodinamikaning birinchi qonuni",
  "Issiqlik dvigatellarining FIK",
];

const elektroAsoslari = [
  "Elektr zaryad. Kulon qonuni",
  "Elektr maydon. Maydon kuchlanganligi",
  "Elektr maydon kuch chiziqlari",
  "Dielektrik singdiruvchanlik",
  "Potensial energiya. Potensial",
  "E va φ orasidagi bog'lanish",
  "Elektr sig'im. Kondensatorlar",
  "Zaryadlangan kondensator energiyasi",
  "Elektr toki. Tok kuchi",
  "Om qonuni. Qarshilik",
  "Elektr zanjirlar",
  "Tok kuchi va kuchlanishni o'lchash",
  "O'zgarmas tokning ishi va quvvati",
  "EYK. To'liq zanjir uchun Om qonuni",
  "Toklarning o'zaro ta'siri. Magnit maydon",
  "Amper kuchi",
  "Lorens kuchi",
  "Moddaning magnit xossalari",
  "Metallarning elektron o'tkazuvchanligi",
  "Yarimo'tkazgichlardagi elektr toki",
  "Vakuumdagi elektr toki. Diod",
  "Suyuqliklardagi elektr toki. Elektroliz",
];

const induksiya = [
  "Magnit oqim. Lens qoidasi",
  "Elektromagnit induksiya qonuni",
  "O'zinduksiya. Induktivlik",
  "Tok magnit maydoni energiyasi",
];

const elektroTebranish = [
  "Tebranish konturi",
  "Garmonik tebranishlar",
  "Tebranishlar fazasi",
  "O'zgaruvchan elektr toki",
  "Aktiv qarshilik",
  "Kondensatorli o'zgaruvchan tok zanjiri",
  "Induktivlik g'altagili zanjir",
  "Elektr zanjiridagi rezonans",
  "Transformatorlar",
  "Elektromagnit to'lqinlar",
];

const optika = [
  "Yorug'likning qaytish va sinish qonunlari",
  "To'la ichki qaytish",
  "Yorug'lik dispersiyasi",
  "Interferensiya",
  "Difraksiya. Difraksion panjara",
  "Yorug'likning qutblanishi",
  "Nisbiylik nazariyasi elementlari",
  "Massa va energiya orasidagi bog'lanish",
  "Nurlanish va spektrlar",
];

const kvant = [
  "Yorug'lik kvantlari. Fotoeffekt",
  "Fotonlar",
  "Atom fizikasi",
  "Yadro fizikasi. Radioaktiv o'zgarishlar",
  "Radioaktiv yemirilish qonuni",
  "Atom yadrosining tuzilishi",
  "Yadro reaksiyalari",
];

export const physicsCurriculum: SubjectCurriculum = {
  id: "physics",
  name: "Fizika",
  sections: [
    {
      id: "boshlangich-fizika",
      name: "#1 Boshlang'ich fizika",
      order: 1,
      subSections: [
        {
          id: "boshlangich-mavzular",
          name: "Boshlang'ich fizika mavzulari",
          lessons: buildLessons("phys-bosh", boshlangich, 8),
        },
      ],
    },
    {
      id: "mexanika",
      name: "#2 Mexanika",
      order: 2,
      subSections: [
        {
          id: "kinematika",
          name: "I. Kinematika asoslari",
          lessons: buildLessons("phys-kin", kinematica, 2),
        },
        {
          id: "dinamika",
          name: "II. Dinamika asoslari",
          lessons: buildLessons("phys-din", dinamika, 0),
        },
        {
          id: "saqlanish",
          name: "III. Mexanikada saqlanish qonunlari",
          lessons: buildLessons("phys-saq", saqlanish, 0),
        },
        {
          id: "mex-tebranish",
          name: "IV. Tebranish va to'lqinlar",
          lessons: buildLessons("phys-mex-t", mexTebranish, 0),
        },
      ],
    },
    {
      id: "molekulyar-termodinamika",
      name: "#3 Molekulyar fizika va termodinamika",
      order: 3,
      subSections: [
        {
          id: "molekulyar-asoslari",
          name: "I. Molekulyar fizika asoslari",
          lessons: buildLessons("phys-mol", molekulyar, 4),
        },
        {
          id: "termodinamika-asoslari",
          name: "II. Termodinamika asoslari",
          lessons: buildLessons("phys-term", termodinamika, 0),
        },
      ],
    },
    {
      id: "elektrodinamika",
      name: "#4 Elektrodinamika",
      order: 4,
      subSections: [
        {
          id: "elektrodinamika-asoslari",
          name: "I. Elektrodinamika asoslari",
          lessons: buildLessons("phys-eld", elektroAsoslari, 0),
        },
        {
          id: "induksiya",
          name: "II. Elektromagnit induksiya",
          lessons: buildLessons("phys-ind", induksiya, 0),
        },
        {
          id: "elektro-tebranish",
          name: "III. Tebranish va to'lqinlar",
          lessons: buildLessons("phys-elt", elektroTebranish, 0),
        },
      ],
    },
    {
      id: "optika",
      name: "#5 Optika",
      order: 5,
      subSections: [
        {
          id: "optika-mavzular",
          name: "Optika mavzulari",
          lessons: buildLessons("phys-opt", optika, 0),
        },
      ],
    },
    {
      id: "kvant-fizika",
      name: "#6 Kvant fizikasi",
      order: 6,
      subSections: [
        {
          id: "kvant-mavzular",
          name: "Kvant fizikasi mavzulari",
          lessons: buildLessons("phys-kvant", kvant, 0),
        },
      ],
    },
  ],
};
