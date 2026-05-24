export type AuthMethod = "email" | "google" | "github";

export interface LoginRecord {
  date: string;
  ip: string;
  device: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  authMethod: AuthMethod;
  password?: string;
  phone?: string;
  status: "active" | "banned" | "pending";
  onlineStatus: "online" | "offline";
  registeredAt: string;
  lastLogin: string;
  deviceInfo: string;
  progress: number;
  xp: number;
  streak: number;
  rank: number;
  lessonsCompleted: number;
  examsPassed: number;
  avgScore: number;
  loginHistory: LoginRecord[];
}

export const adminUsers: AdminUser[] = [
  {
    id: "u1",
    fullName: "Javohir Dilshodov",
    username: "javohir_d",
    email: "javohir@mail.uz",
    authMethod: "email",
    password: "TriCore#2026!",
    phone: "+998 90 123 45 67",
    status: "active",
    onlineStatus: "online",
    registeredAt: "2025-11-12",
    lastLogin: "2026-05-21 09:14",
    deviceInfo: "Windows 10 · Chrome 124",
    progress: 32,
    xp: 8420,
    streak: 14,
    rank: 2847,
    lessonsCompleted: 47,
    examsPassed: 12,
    avgScore: 78,
    loginHistory: [
      { date: "2026-05-21 09:14", ip: "192.168.1.42", device: "Chrome / Windows" },
      { date: "2026-05-20 18:02", ip: "192.168.1.42", device: "Chrome / Windows" },
      { date: "2026-05-19 11:30", ip: "10.0.0.8", device: "Mobile Safari" },
    ],
  },
  {
    id: "u2",
    fullName: "Alex Chen",
    username: "alexchen",
    email: "alex.chen@gmail.com",
    authMethod: "google",
    status: "active",
    onlineStatus: "online",
    registeredAt: "2025-09-03",
    lastLogin: "2026-05-21 08:55",
    deviceInfo: "macOS · Safari 17",
    progress: 78,
    xp: 45200,
    streak: 89,
    rank: 1,
    lessonsCompleted: 210,
    examsPassed: 64,
    avgScore: 91,
    loginHistory: [
      { date: "2026-05-21 08:55", ip: "104.28.12.1", device: "Google OAuth · macOS" },
      { date: "2026-05-20 22:10", ip: "104.28.12.1", device: "Google OAuth · macOS" },
    ],
  },
  {
    id: "u3",
    fullName: "Sara Kim",
    username: "sarakim",
    email: "sara.kim@gmail.com",
    authMethod: "google",
    status: "active",
    onlineStatus: "offline",
    registeredAt: "2025-10-18",
    lastLogin: "2026-05-20 16:40",
    deviceInfo: "Android 14 · Chrome Mobile",
    progress: 65,
    xp: 42100,
    streak: 76,
    rank: 2,
    lessonsCompleted: 185,
    examsPassed: 58,
    avgScore: 88,
    loginHistory: [
      { date: "2026-05-20 16:40", ip: "203.0.113.8", device: "Google OAuth · Android" },
    ],
  },
  {
    id: "u4",
    fullName: "Dilnoza Karimova",
    username: "dilnoza_k",
    email: "dilnoza@student.uz",
    authMethod: "email",
    password: "Study@Physics99",
    status: "active",
    onlineStatus: "offline",
    registeredAt: "2026-01-05",
    lastLogin: "2026-05-19 14:22",
    deviceInfo: "Windows 11 · Edge 122",
    progress: 18,
    xp: 3200,
    streak: 5,
    rank: 5120,
    lessonsCompleted: 22,
    examsPassed: 4,
    avgScore: 72,
    loginHistory: [
      { date: "2026-05-19 14:22", ip: "185.139.22.10", device: "Edge / Windows" },
      { date: "2026-05-18 10:05", ip: "185.139.22.10", device: "Edge / Windows" },
    ],
  },
  {
    id: "u5",
    fullName: "Mike Johnson",
    username: "mikej",
    email: "mike@mail.com",
    authMethod: "email",
    password: "TempPass#001",
    status: "banned",
    onlineStatus: "offline",
    registeredAt: "2025-12-01",
    lastLogin: "2026-04-02 11:00",
    deviceInfo: "Linux · Firefox 125",
    progress: 12,
    xp: 890,
    streak: 0,
    rank: 98400,
    lessonsCompleted: 8,
    examsPassed: 1,
    avgScore: 45,
    loginHistory: [
      { date: "2026-04-02 11:00", ip: "198.51.100.4", device: "Firefox / Linux" },
    ],
  },
  {
    id: "u6",
    fullName: "Elena Petrova",
    username: "elena_p",
    email: "elena@yandex.ru",
    authMethod: "github",
    status: "active",
    onlineStatus: "online",
    registeredAt: "2026-02-14",
    lastLogin: "2026-05-21 07:30",
    deviceInfo: "Windows 10 · Chrome 124",
    progress: 54,
    xp: 8100,
    streak: 21,
    rank: 3100,
    lessonsCompleted: 68,
    examsPassed: 15,
    avgScore: 81,
    loginHistory: [
      { date: "2026-05-21 07:30", ip: "77.88.55.2", device: "GitHub OAuth · Windows" },
    ],
  },
];
