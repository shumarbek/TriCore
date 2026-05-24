export interface AdminMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  body: string;
  createdAt: string;
  status: "open" | "replied" | "closed";
  adminReply?: string;
  repliedAt?: string;
}

export const adminMessages: AdminMessage[] = [
  {
    id: "m1",
    userId: "u1",
    userName: "Javohir Dilshodov",
    userEmail: "javohir@mail.uz",
    subject: "Video yuklanmayapti",
    body: "Planimetriya 5-dars videosi ochilmayapti. Iltimos tekshiring.",
    createdAt: "2026-05-21 10:30",
    status: "open",
  },
  {
    id: "m2",
    userId: "u4",
    userName: "Dilnoza Karimova",
    userEmail: "dilnoza@student.uz",
    subject: "Practice exam savoli",
    body: "Molekulyar fizika bo'limida imtihon boshlanmayapti.",
    createdAt: "2026-05-20 15:12",
    status: "replied",
    adminReply: "Muammo tuzatildi. Sahifani yangilab qayta urinib ko'ring.",
    repliedAt: "2026-05-20 16:00",
  },
  {
    id: "m3",
    userId: "u2",
    userName: "Alex Chen",
    userEmail: "alex.chen@gmail.com",
    subject: "Reyting yangilanishi",
    body: "Global reytingim kech yangilanmoqda.",
    createdAt: "2026-05-19 09:00",
    status: "closed",
    adminReply: "Reytinglar har soat yangilanadi.",
    repliedAt: "2026-05-19 11:30",
  },
];
