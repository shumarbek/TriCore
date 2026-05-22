export const userStats = {
  overallProgress: 32,
  dailyStreak: 14,
  completedLessons: 47,
  examsPassed: 12,
  xp: 8420,
  level: 12,
  rank: 2847,
  weeklyHours: [2.5, 3.2, 1.8, 4.1, 2.9, 5.2, 3.8],
};

export const recentActivity = [
  { type: "lesson", title: "Quadratic Equations", subject: "Mathematics", time: "2h ago" },
  { type: "exam", title: "Mechanics Mini Exam", subject: "Physics", time: "5h ago" },
  { type: "homework", title: "Periodic Table Assignment", subject: "Chemistry", time: "1d ago" },
];

export const aiRecommendations = [
  { type: "next", title: "Linear Functions & Graphs", subject: "Mathematics", reason: "Continue Algebra path" },
  { type: "weak", title: "Trigonometry Basics", subject: "Mathematics", reason: "62% accuracy — needs revision" },
  { type: "revision", title: "Newton's Laws", subject: "Physics", reason: "Last studied 12 days ago" },
];

export const globalRankings = [
  { rank: 1, name: "Alex Chen", xp: 45200, streak: 89, avatar: "AC" },
  { rank: 2, name: "Sara Kim", xp: 42100, streak: 76, avatar: "SK" },
  { rank: 3, name: "Omar Hassan", xp: 39800, streak: 64, avatar: "OH" },
  { rank: 4, name: "You", xp: 8420, streak: 14, avatar: "YU", isYou: true },
  { rank: 5, name: "Elena Petrova", xp: 8100, streak: 21, avatar: "EP" },
];

export const lessons = [
  {
    id: "quad-eq",
    title: "Quadratic Equations",
    subject: "Mathematics",
    section: "Algebra",
    duration: "24 min",
    status: "in_progress" as const,
    progress: 65,
  },
  {
    id: "newton-laws",
    title: "Newton's Laws of Motion",
    subject: "Physics",
    section: "Mechanics",
    duration: "32 min",
    status: "available" as const,
    progress: 0,
  },
  {
    id: "periodic-table",
    title: "Periodic Table & Trends",
    subject: "Chemistry",
    section: "General Chemistry",
    duration: "28 min",
    status: "completed" as const,
    progress: 100,
  },
  {
    id: "trig-basics",
    title: "Trigonometry Basics",
    subject: "Mathematics",
    section: "Algebra",
    duration: "35 min",
    status: "locked" as const,
    progress: 0,
  },
];

export { sectionHomeworkItems as homeworkItems } from "./curriculum";

export const supportTickets = [
  { id: "T-1042", subject: "Video playback issue", status: "open", date: "May 20" },
  { id: "T-1038", subject: "Homework upload failed", status: "resolved", date: "May 18" },
];

export const faqItems = [
  { q: "How does the learning roadmap work?", a: "Each subject is divided into sections, modules, and lessons. Complete lessons and mini exams to unlock the next content." },
  { q: "How is XP calculated?", a: "You earn XP from lessons, exams, homework, daily streaks, and ranking achievements." },
  { q: "Can I use the AI assistant during exams?", a: "AI assistance is disabled during graded exams but available for practice and lessons." },
];


export const badges = [
  { name: "Algebra Master", earned: true, icon: "🏆" },
  { name: "Geometry Expert", earned: false, icon: "📐" },
  { name: "Physics Genius", earned: false, icon: "⚡" },
  { name: "Chemistry Pro", earned: false, icon: "🧪" },
  { name: "14-Day Streak", earned: true, icon: "🔥" },
];

export const adminStats = {
  totalUsers: 12847,
  activeUsers: 3421,
  revenue: 48200,
  completionRate: 68,
  aiUsage: 15620,
};
