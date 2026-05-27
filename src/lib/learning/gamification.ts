import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export const XP_REWARDS = {
  lessonComplete: 50,
  lessonExam: 25,
  practiceExam: 40,
} as const;

type ActivityDelta = {
  lessons_completed?: number;
  exams_taken?: number;
  time_spent_minutes?: number;
};

function toDateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function getYesterdayKey(d = new Date()) {
  const x = new Date(d);
  x.setDate(x.getDate() - 1);
  return toDateKey(x);
}

function calcLevel(xp: number) {
  return Math.floor(xp / 1000) + 1;
}

export async function addXp(
  supabase: SupabaseClient<Database>,
  userId: string,
  xpDelta: number
) {
  if (xpDelta <= 0) return;
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp")
    .eq("id", userId)
    .single();
  const currentXp = (profile as { xp?: number } | null)?.xp ?? 0;
  const nextXp = currentXp + xpDelta;
  await supabase
    .from("profiles")
    .update({ xp: nextXp, level: calcLevel(nextXp) } as never)
    .eq("id", userId);
}

export async function incrementDailyActivity(
  supabase: SupabaseClient<Database>,
  userId: string,
  delta: ActivityDelta
) {
  const today = toDateKey();
  const { data: row } = await supabase
    .from("daily_activity")
    .select("lessons_completed, exams_taken, ai_requests, time_spent_minutes")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  const typedRow = row as
    | {
        lessons_completed?: number;
        exams_taken?: number;
        ai_requests?: number;
        time_spent_minutes?: number;
      }
    | null;

  await supabase.from("daily_activity").upsert(
    {
      user_id: userId,
      date: today,
      lessons_completed: (typedRow?.lessons_completed ?? 0) + (delta.lessons_completed ?? 0),
      exams_taken: (typedRow?.exams_taken ?? 0) + (delta.exams_taken ?? 0),
      ai_requests: typedRow?.ai_requests ?? 0,
      time_spent_minutes: (typedRow?.time_spent_minutes ?? 0) + (delta.time_spent_minutes ?? 0),
    } as never,
    { onConflict: "user_id,date" }
  );
}

export async function ensureDailyActive(
  supabase: SupabaseClient<Database>,
  userId: string,
  lastSeen?: string | null,
  currentStreak?: number
) {
  const today = toDateKey();
  await supabase
    .from("daily_activity")
    .upsert({ user_id: userId, date: today } as never, { onConflict: "user_id,date" });

  if (!lastSeen) return;
  const lastSeenDate = lastSeen.slice(0, 10);
  if (lastSeenDate === today) return;
  const yesterday = getYesterdayKey();
  const nextStreak = lastSeenDate === yesterday ? (currentStreak ?? 0) + 1 : 1;
  await supabase.from("profiles").update({ streak: nextStreak } as never).eq("id", userId);
}
