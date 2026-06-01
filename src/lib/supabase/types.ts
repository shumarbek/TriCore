export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          username: string;
          avatar_url: string | null;
          role: "user" | "admin";
          status: "active" | "banned";
          is_online: boolean;
          xp: number;
          streak: number;
          level: number;
          last_seen: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          username: string;
          avatar_url?: string | null;
          role?: "user" | "admin";
          status?: "active" | "banned";
          is_online?: boolean;
          xp?: number;
          streak?: number;
          level?: number;
          last_seen?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          subject_id: string;
          section_id: string;
          sub_section_id: string;
          status: "not_started" | "in_progress" | "completed";
          progress_percent: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          subject_id: string;
          section_id: string;
          sub_section_id: string;
          status?: "not_started" | "in_progress" | "completed";
          progress_percent?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_progress"]["Insert"]>;
      };
      exam_questions: {
        Row: {
          id: string;
          subject_id: string;
          section_id: string;
          sub_section_id: string;
          question: string;
          options: string[];
          correct_index: number;
          explanation: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          section_id: string;
          sub_section_id: string;
          question: string;
          options: string[];
          correct_index: number;
          explanation: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["exam_questions"]["Insert"]>;
      };
      exam_results: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          section_id: string;
          sub_section_id: string;
          score: number;
          total_questions: number;
          correct_answers: number;
          time_spent: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          section_id: string;
          sub_section_id: string;
          score: number;
          total_questions: number;
          correct_answers: number;
          time_spent: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["exam_results"]["Insert"]>;
      };
      practice_exam_guard: {
        Row: {
          id: string;
          user_id: string;
          guard_date: string;
          cheat_attempts: number;
          blocked_until: string | null;
          last_reason: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          guard_date: string;
          cheat_attempts?: number;
          blocked_until?: string | null;
          last_reason?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["practice_exam_guard"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string | null;
          subject: string;
          body: string;
          status: "open" | "replied" | "closed";
          admin_reply: string | null;
          replied_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id?: string | null;
          subject: string;
          body: string;
          status?: "open" | "replied" | "closed";
          admin_reply?: string | null;
          replied_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          subject: string | null;
          lesson_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          subject?: string | null;
          lesson_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notes"]["Insert"]>;
      };
      ai_config: {
        Row: {
          id: string;
          api_key: string;
          model: string;
          platform_context: string;
          updated_by: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          api_key: string;
          model: string;
          platform_context: string;
          updated_by: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_config"]["Insert"]>;
      };
      ai_usage: {
        Row: {
          id: string;
          user_id: string;
          tokens_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tokens_used: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_usage"]["Insert"]>;
      };
      curriculum_structure: {
        Row: {
          id: string;
          node_id: string;
          node_type: "section" | "sub_section";
          subject_id: string;
          parent_section_id: string;
          name: string;
          order_index: number;
          is_deleted: boolean;
          updated_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          node_id: string;
          node_type: "section" | "sub_section";
          subject_id: string;
          parent_section_id?: string;
          name: string;
          order_index?: number;
          is_deleted?: boolean;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["curriculum_structure"]["Insert"]>;
      };
      daily_activity: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          lessons_completed: number;
          exams_taken: number;
          ai_requests: number;
          time_spent_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          lessons_completed?: number;
          exams_taken?: number;
          ai_requests?: number;
          time_spent_minutes?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_activity"]["Insert"]>;
      };
      lesson_content: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          subject_id: string;
          subject_name: string;
          section_id: string;
          section_name: string;
          sub_section_id: string;
          sub_section_name: string;
          order_index: number;
          video_url: string;
          handbook_rules: string;
          handbook_terms: string;
          formulas: string;
          mini_exam_count: number;
          mini_exam_questions: string;
          homework_pdf: string;
          homework_deadline: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          subject_id?: string;
          subject_name?: string;
          section_id?: string;
          section_name?: string;
          sub_section_id?: string;
          sub_section_name?: string;
          order_index?: number;
          video_url?: string;
          handbook_rules?: string;
          handbook_terms?: string;
          formulas?: string;
          mini_exam_count?: number;
          mini_exam_questions?: string;
          homework_pdf?: string;
          homework_deadline?: string;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_content"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
