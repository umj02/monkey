export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string | null; avatar_url: string | null; theme: string | null; created_at: string | null };
        Insert: { id: string; display_name?: string | null; avatar_url?: string | null; theme?: string | null; created_at?: string | null };
        Update: { id?: string; display_name?: string | null; avatar_url?: string | null; theme?: string | null; created_at?: string | null };
      };
      time_blocks: {
        Row: { id: string; user_id: string; block_date: string; start_time: string | null; title: string; color: string; icon: string | null; sort_order: number | null; created_at: string | null };
        Insert: { id?: string; user_id: string; block_date: string; start_time?: string | null; title: string; color?: string; icon?: string | null; sort_order?: number | null; created_at?: string | null };
        Update: { id?: string; user_id?: string; block_date?: string; start_time?: string | null; title?: string; color?: string; icon?: string | null; sort_order?: number | null; created_at?: string | null };
      };
      tasks: {
        Row: { id: string; user_id: string; block_id: string | null; title: string; done: boolean | null; sort_order: number | null; reminder_at: string | null; created_at: string | null };
        Insert: { id?: string; user_id: string; block_id?: string | null; title: string; done?: boolean | null; sort_order?: number | null; reminder_at?: string | null; created_at?: string | null };
        Update: { id?: string; user_id?: string; block_id?: string | null; title?: string; done?: boolean | null; sort_order?: number | null; reminder_at?: string | null; created_at?: string | null };
      };
      notes: {
        Row: { id: string; user_id: string; title: string; body: string | null; color: string | null; created_at: string | null };
        Insert: { id?: string; user_id: string; title: string; body?: string | null; color?: string | null; created_at?: string | null };
        Update: { id?: string; user_id?: string; title?: string; body?: string | null; color?: string | null; created_at?: string | null };
      };
      reminders: {
        Row: { id: string; user_id: string; task_id: string | null; title: string; remind_time: string; repeat_rule: string | null; enabled: boolean | null; created_at: string | null };
        Insert: { id?: string; user_id: string; task_id?: string | null; title: string; remind_time: string; repeat_rule?: string | null; enabled?: boolean | null; created_at?: string | null };
        Update: { id?: string; user_id?: string; task_id?: string | null; title?: string; remind_time?: string; repeat_rule?: string | null; enabled?: boolean | null; created_at?: string | null };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
