"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type LanguageCode = "uz" | "kaa" | "ru" | "en";

type TranslationDictionary = {
  languageNames: Record<LanguageCode, string>;
  betaBadge: string;
  common: {
    notifications: string;
    noNotifications: string;
    logout: string;
    adminPanel: string;
    theme: string;
    collapse: string;
    originalVideo: string;
    loading: string;
  };
  nav: {
    dashboard: string;
    learning: string;
    lessons: string;
    practiceExams: string;
    rankings: string;
    aiAssistant: string;
    homework: string;
    notes: string;
    support: string;
    settings: string;
    overview: string;
    content: string;
    examBank: string;
    users: string;
    messages: string;
    analytics: string;
    aiSettings: string;
  };
  header: {
    searchPlaceholder: string;
    newSupportMessage: string;
    supportReply: string;
  };
  settings: {
    title: string;
    description: string;
    profile: string;
    appearance: string;
    notifications: string;
    language: string;
    security: string;
    save: string;
    saved: string;
    fullName: string;
    username: string;
    email: string;
    darkMode: string;
    lightMode: string;
    lessonReminders: string;
    homeworkDeadlines: string;
    rankingUpdates: string;
    aiRecommendations: string;
    interfaceLanguage: string;
    currentPassword: string;
    newPassword: string;
    changePassword: string;
    enableTwoFactor: string;
    languageInfoTitle: string;
    languageInfoBody: string;
  };
  banned: {
    title: string;
    body: string;
    action: string;
  };
};

const dictionaries: Record<LanguageCode, TranslationDictionary> = {
  uz: {
    languageNames: { uz: "O'zbek", kaa: "Qoraqalpoq", ru: "Русский", en: "English" },
    betaBadge: "BETA",
    common: {
      notifications: "Bildirishnomalar",
      noNotifications: "Yangi bildirishnoma yo'q.",
      logout: "Chiqish",
      adminPanel: "Admin Panel",
      theme: "Mavzu",
      collapse: "Yig'ish",
      originalVideo: "Original video",
      loading: "Yuklanmoqda...",
    },
    nav: {
      dashboard: "Bosh sahifa",
      learning: "O'rganish",
      lessons: "Darslar",
      practiceExams: "Amaliy imtihonlar",
      rankings: "Reyting",
      aiAssistant: "AI yordamchi",
      homework: "Uy vazifalari",
      notes: "Qaydlar",
      support: "Yordam",
      settings: "Sozlamalar",
      overview: "Umumiy ko'rinish",
      content: "Kontent",
      examBank: "Imtihon banki",
      users: "Foydalanuvchilar",
      messages: "Xabarlar",
      analytics: "Tahlil",
      aiSettings: "AI sozlamalari",
    },
    header: {
      searchPlaceholder: "Darslar, notes, mavzularni qidirish...",
      newSupportMessage: "Yangi support xabar",
      supportReply: "Support javobi",
    },
    settings: {
      title: "Sozlamalar",
      description: "Profilingiz va interfeysni sozlang",
      profile: "Profil",
      appearance: "Ko'rinish",
      notifications: "Bildirishnomalar",
      language: "Til",
      security: "Xavfsizlik",
      save: "Saqlash",
      saved: "Saqlandi!",
      fullName: "To'liq ism",
      username: "Username",
      email: "Email",
      darkMode: "Qorong'i rejim",
      lightMode: "Yorug' rejim",
      lessonReminders: "Dars eslatmalari",
      homeworkDeadlines: "Homework eslatmalari",
      rankingUpdates: "Reyting yangilanishlari",
      aiRecommendations: "AI tavsiyalari",
      interfaceLanguage: "Interfeys tili",
      currentPassword: "Joriy parol",
      newPassword: "Yangi parol",
      changePassword: "Parolni o'zgartirish",
      enableTwoFactor: "Ikki bosqichli himoyani yoqish",
      languageInfoTitle: "BETA tillar haqida",
      languageInfoBody:
        "BETA tillar hozircha faqat platforma interfeysi uchun amal qiladi. Keyinchalik bu tillarga mos alohida darsliklar ham qo'shiladi.",
    },
    banned: {
      title: "Akkount bloklangan",
      body: "Administrator sizning platformadan foydalanishingizni vaqtincha cheklagan. Darslar va imtihonlardan foydalanish bloklandi.",
      action: "Chiqish",
    },
  },
  kaa: {
    languageNames: { uz: "O'zbek", kaa: "Qaraqalpaq", ru: "Русский", en: "English" },
    betaBadge: "BETA",
    common: {
      notifications: "Xabarlamalar",
      noNotifications: "Jańa xabarlama joq.",
      logout: "Shıǵıw",
      adminPanel: "Admin Panel",
      theme: "Tema",
      collapse: "Jıyıw",
      originalVideo: "Original video",
      loading: "Júklenip atır...",
    },
    nav: {
      dashboard: "Bas bet",
      learning: "Oqiw",
      lessons: "Sabaqlar",
      practiceExams: "Ámeliy examlar",
      rankings: "Reyting",
      aiAssistant: "AI járdemshi",
      homework: "Úy tapsırmaları",
      notes: "Qaydlar",
      support: "Járdem",
      settings: "Sazlawlar",
      overview: "Ulıwma kórinis",
      content: "Kontent",
      examBank: "Exam banki",
      users: "Paydalanıwshılar",
      messages: "Xabarlar",
      analytics: "Analitika",
      aiSettings: "AI sazlawları",
    },
    header: {
      searchPlaceholder: "Sabaq, notes, tema izlew...",
      newSupportMessage: "Jańa support xabar",
      supportReply: "Support juwabı",
    },
    settings: {
      title: "Sazlawlar",
      description: "Profil hám interfeysti sazlań",
      profile: "Profil",
      appearance: "Kórinis",
      notifications: "Xabarlamalar",
      language: "Til",
      security: "Qáwipsizlik",
      save: "Saqlaw",
      saved: "Saqlandı!",
      fullName: "Tolıq at",
      username: "Username",
      email: "Email",
      darkMode: "Qaranǵı rejim",
      lightMode: "Jarıq rejim",
      lessonReminders: "Sabaq eskertpeleri",
      homeworkDeadlines: "Homework eskertpeleri",
      rankingUpdates: "Reyting jańalanıwları",
      aiRecommendations: "AI usınısları",
      interfaceLanguage: "Interfeys tili",
      currentPassword: "Házirki parol",
      newPassword: "Jańa parol",
      changePassword: "Paroldi ózgertiw",
      enableTwoFactor: "Eki basqıshlı qorǵawdı qosıw",
      languageInfoTitle: "BETA tiller haqqında",
      languageInfoBody:
        "BETA tiller házirge shekem tek platforma interfeysi ushın isleydi. Keyin ala bul tillerge mos bólek sabaqlıqlar qosıladı.",
    },
    banned: {
      title: "Akkount bloklandı",
      body: "Administrator sizdiń platformadan paydalanıwıńızdı waqtınsha shekledi. Sabaqlar hám examlardan paydalanıw bloklandı.",
      action: "Shıǵıw",
    },
  },
  ru: {
    languageNames: { uz: "O'zbek", kaa: "Qoraqalpoq", ru: "Русский", en: "English" },
    betaBadge: "BETA",
    common: {
      notifications: "Уведомления",
      noNotifications: "Новых уведомлений нет.",
      logout: "Выйти",
      adminPanel: "Админ панель",
      theme: "Тема",
      collapse: "Свернуть",
      originalVideo: "Оригинальное видео",
      loading: "Загрузка...",
    },
    nav: {
      dashboard: "Панель",
      learning: "Обучение",
      lessons: "Уроки",
      practiceExams: "Практические экзамены",
      rankings: "Рейтинг",
      aiAssistant: "AI помощник",
      homework: "Домашние задания",
      notes: "Заметки",
      support: "Поддержка",
      settings: "Настройки",
      overview: "Обзор",
      content: "Контент",
      examBank: "Банк экзаменов",
      users: "Пользователи",
      messages: "Сообщения",
      analytics: "Аналитика",
      aiSettings: "Настройки AI",
    },
    header: {
      searchPlaceholder: "Поиск уроков, заметок, тем...",
      newSupportMessage: "Новое сообщение support",
      supportReply: "Ответ support",
    },
    settings: {
      title: "Настройки",
      description: "Настройте профиль и интерфейс",
      profile: "Профиль",
      appearance: "Внешний вид",
      notifications: "Уведомления",
      language: "Язык",
      security: "Безопасность",
      save: "Сохранить",
      saved: "Сохранено!",
      fullName: "Полное имя",
      username: "Username",
      email: "Email",
      darkMode: "Тёмный режим",
      lightMode: "Светлый режим",
      lessonReminders: "Напоминания об уроках",
      homeworkDeadlines: "Напоминания о homework",
      rankingUpdates: "Обновления рейтинга",
      aiRecommendations: "Рекомендации AI",
      interfaceLanguage: "Язык интерфейса",
      currentPassword: "Текущий пароль",
      newPassword: "Новый пароль",
      changePassword: "Сменить пароль",
      enableTwoFactor: "Включить двухфакторную защиту",
      languageInfoTitle: "О BETA языках",
      languageInfoBody:
        "BETA языки пока применяются только к интерфейсу платформы. Позже будут добавлены и отдельные учебные материалы для этих языков.",
    },
    banned: {
      title: "Аккаунт заблокирован",
      body: "Администратор временно ограничил ваш доступ к платформе. Доступ к урокам и экзаменам заблокирован.",
      action: "Выйти",
    },
  },
  en: {
    languageNames: { uz: "O'zbek", kaa: "Qoraqalpoq", ru: "Русский", en: "English" },
    betaBadge: "BETA",
    common: {
      notifications: "Notifications",
      noNotifications: "No new notifications.",
      logout: "Log out",
      adminPanel: "Admin Panel",
      theme: "Theme",
      collapse: "Collapse",
      originalVideo: "Original video",
      loading: "Loading...",
    },
    nav: {
      dashboard: "Dashboard",
      learning: "Learning",
      lessons: "Lessons",
      practiceExams: "Practice Exams",
      rankings: "Rankings",
      aiAssistant: "AI Assistant",
      homework: "Homework",
      notes: "Notes",
      support: "Support",
      settings: "Settings",
      overview: "Overview",
      content: "Content",
      examBank: "Exam Bank",
      users: "Users",
      messages: "Messages",
      analytics: "Analytics",
      aiSettings: "AI Settings",
    },
    header: {
      searchPlaceholder: "Search lessons, notes, topics...",
      newSupportMessage: "New support message",
      supportReply: "Support reply",
    },
    settings: {
      title: "Settings",
      description: "Configure your profile and interface",
      profile: "Profile",
      appearance: "Appearance",
      notifications: "Notifications",
      language: "Language",
      security: "Security",
      save: "Save",
      saved: "Saved!",
      fullName: "Full Name",
      username: "Username",
      email: "Email",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      lessonReminders: "Lesson reminders",
      homeworkDeadlines: "Homework deadlines",
      rankingUpdates: "Ranking updates",
      aiRecommendations: "AI recommendations",
      interfaceLanguage: "Interface Language",
      currentPassword: "Current Password",
      newPassword: "New Password",
      changePassword: "Change Password",
      enableTwoFactor: "Enable Two-Factor Auth",
      languageInfoTitle: "About BETA languages",
      languageInfoBody:
        "BETA languages currently apply only to the platform interface. Matching lesson content for these languages will be added later.",
    },
    banned: {
      title: "Account blocked",
      body: "The administrator has temporarily restricted your access to the platform. Lessons and exams are blocked.",
      action: "Log out",
    },
  },
};

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: TranslationDictionary;
  isBetaLanguage: (language?: LanguageCode) => boolean;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "uz",
  setLanguage: () => {},
  t: dictionaries.uz,
  isBetaLanguage: () => false,
});

const STORAGE_KEY = "tricore-language";
const COOKIE_KEY = "tricore-language";

function isLanguageCode(value: string | null | undefined): value is LanguageCode {
  return value === "uz" || value === "kaa" || value === "ru" || value === "en";
}

function readLanguageCookie() {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${COOKIE_KEY}=`))
    ?.split("=")[1];
  return isLanguageCode(raw) ? raw : null;
}

function readInitialLanguage() {
  if (typeof window === "undefined") return "uz" as LanguageCode;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (isLanguageCode(stored)) return stored;
  const cookieValue = readLanguageCookie();
  if (cookieValue) return cookieValue;
  return "uz" as LanguageCode;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(readInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    localStorage.setItem(STORAGE_KEY, language);
    document.cookie = `${COOKIE_KEY}=${language}; path=/; max-age=31536000; samesite=lax`;
  }, [language]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (isLanguageCode(event.newValue)) {
        setLanguageState(event.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      t: dictionaries[language],
      isBetaLanguage: (candidate = language) => candidate !== "uz",
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
