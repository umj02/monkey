export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string | null; email: string | null; avatar_url: string | null; theme: string | null; has_completed_onboarding: boolean | null; created_at: string | null; updated_at: string | null };
        Insert: { id: string; display_name?: string | null; email?: string | null; avatar_url?: string | null; theme?: string | null; has_completed_onboarding?: boolean | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; display_name?: string | null; email?: string | null; avatar_url?: string | null; theme?: string | null; has_completed_onboarding?: boolean | null; created_at?: string | null; updated_at?: string | null };
      };
      time_blocks: {
        Row: { id: string; user_id: string; block_date: string; start_time: string | null; title: string; color: string; icon: string | null; sort_order: number | null; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id: string; block_date: string; start_time?: string | null; title: string; color?: string; icon?: string | null; sort_order?: number | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string; block_date?: string; start_time?: string | null; title?: string; color?: string; icon?: string | null; sort_order?: number | null; created_at?: string | null; updated_at?: string | null };
      };
      tasks: {
        Row: { id: string; user_id: string; block_id: string | null; title: string; icon: string | null; done: boolean | null; sort_order: number | null; reminder_at: string | null; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id: string; block_id?: string | null; title: string; icon?: string | null; done?: boolean | null; sort_order?: number | null; reminder_at?: string | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string; block_id?: string | null; title?: string; icon?: string | null; done?: boolean | null; sort_order?: number | null; reminder_at?: string | null; created_at?: string | null; updated_at?: string | null };
      };
      notes: {
        Row: { id: string; user_id: string; title: string; body: string | null; color: string | null; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id: string; title: string; body?: string | null; color?: string | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string; title?: string; body?: string | null; color?: string | null; created_at?: string | null; updated_at?: string | null };
      };
      reminders: {
        Row: { id: string; user_id: string; task_id: string | null; calendar_event_id: string | null; title: string; remind_time: string; repeat_rule: string | null; enabled: boolean | null; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id: string; task_id?: string | null; calendar_event_id?: string | null; title: string; remind_time: string; repeat_rule?: string | null; enabled?: boolean | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string; task_id?: string | null; calendar_event_id?: string | null; title?: string; remind_time?: string; repeat_rule?: string | null; enabled?: boolean | null; created_at?: string | null; updated_at?: string | null };
      };
      calendar_events: {
        Row: { id: string; user_id: string; event_date: string; start_time: string | null; end_time: string | null; title: string; icon_key: string | null; activity_type_key: string | null; color: "yellow" | "blue" | "green" | "pink" | "purple" | "orange"; recurrence_type: "none" | "daily" | "custom_days" | null; recurrence_days: number[] | null; recurrence_until: string | null; recurrence_group_id: string | null; done: boolean | null; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id: string; event_date: string; start_time?: string | null; end_time?: string | null; title: string; icon_key?: string | null; activity_type_key?: string | null; color?: "yellow" | "blue" | "green" | "pink" | "purple" | "orange"; recurrence_type?: "none" | "daily" | "custom_days" | null; recurrence_days?: number[] | null; recurrence_until?: string | null; recurrence_group_id?: string | null; done?: boolean | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string; event_date?: string; start_time?: string | null; end_time?: string | null; title?: string; icon_key?: string | null; activity_type_key?: string | null; color?: "yellow" | "blue" | "green" | "pink" | "purple" | "orange"; recurrence_type?: "none" | "daily" | "custom_days" | null; recurrence_days?: number[] | null; recurrence_until?: string | null; recurrence_group_id?: string | null; done?: boolean | null; created_at?: string | null; updated_at?: string | null };
      };

      calendar_event_completions: {
        Row: { id: string; user_id: string; calendar_event_id: string; occurrence_date: string; done: boolean | null; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id: string; calendar_event_id: string; occurrence_date: string; done?: boolean | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string; calendar_event_id?: string; occurrence_date?: string; done?: boolean | null; created_at?: string | null; updated_at?: string | null };
      };

      calendar_event_occurrence_overrides: {
        Row: { id: string; user_id: string; calendar_event_id: string; occurrence_date: string; title: string | null; start_time: string | null; end_time: string | null; color: "yellow" | "blue" | "green" | "pink" | "purple" | "orange" | null; icon_key: string | null; activity_type_key: string | null; reminder_at: string | null; is_cancelled: boolean | null; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id: string; calendar_event_id: string; occurrence_date: string; title?: string | null; start_time?: string | null; end_time?: string | null; color?: "yellow" | "blue" | "green" | "pink" | "purple" | "orange" | null; icon_key?: string | null; activity_type_key?: string | null; reminder_at?: string | null; is_cancelled?: boolean | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string; calendar_event_id?: string; occurrence_date?: string; title?: string | null; start_time?: string | null; end_time?: string | null; color?: "yellow" | "blue" | "green" | "pink" | "purple" | "orange" | null; icon_key?: string | null; activity_type_key?: string | null; reminder_at?: string | null; is_cancelled?: boolean | null; created_at?: string | null; updated_at?: string | null };
      };

      push_subscriptions: {
        Row: { id: string; user_id: string; endpoint: string; p256dh: string; auth: string; timezone: string | null; user_agent: string | null; enabled: boolean | null; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id: string; endpoint: string; p256dh: string; auth: string; timezone?: string | null; user_agent?: string | null; enabled?: boolean | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string; endpoint?: string; p256dh?: string; auth?: string; timezone?: string | null; user_agent?: string | null; enabled?: boolean | null; created_at?: string | null; updated_at?: string | null };
      };
      push_notification_deliveries: {
        Row: { id: string; user_id: string; reminder_id: string; scheduled_for: string; sent_at: string | null; status: string | null; error_message: string | null; created_at: string | null };
        Insert: { id?: string; user_id: string; reminder_id: string; scheduled_for: string; sent_at?: string | null; status?: string | null; error_message?: string | null; created_at?: string | null };
        Update: { id?: string; user_id?: string; reminder_id?: string; scheduled_for?: string; sent_at?: string | null; status?: string | null; error_message?: string | null; created_at?: string | null };
      };
      wallet_transactions: {
        Row: { id: string; user_id: string; type: "income" | "expense" | "saving" | "extra"; title: string; amount: number; currency: "CRC" | "USD"; category: string; icon: string | null; transaction_date: string; period: "weekly" | "biweekly" | "monthly"; expense_kind: "variable" | "planned" | null; planned_expense_id: string | null; note: string | null; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id: string; type: "income" | "expense" | "saving" | "extra"; title: string; amount: number; currency?: "CRC" | "USD"; category: string; icon?: string | null; transaction_date: string; period: "weekly" | "biweekly" | "monthly"; expense_kind?: "variable" | "planned" | null; planned_expense_id?: string | null; note?: string | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string; type?: "income" | "expense" | "saving" | "extra"; title?: string; amount?: number; currency?: "CRC" | "USD"; category?: string; icon?: string | null; transaction_date?: string; period?: "weekly" | "biweekly" | "monthly"; expense_kind?: "variable" | "planned" | null; planned_expense_id?: string | null; note?: string | null; created_at?: string | null; updated_at?: string | null };
      };
      wallet_budgets: {
        Row: { id: string; user_id: string; period: "weekly" | "biweekly" | "monthly"; limit_amount: number; currency: "CRC" | "USD"; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id: string; period: "weekly" | "biweekly" | "monthly"; limit_amount: number; currency?: "CRC" | "USD"; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string; period?: "weekly" | "biweekly" | "monthly"; limit_amount?: number; currency?: "CRC" | "USD"; created_at?: string | null; updated_at?: string | null };
      };
      wallet_goals: {
        Row: { id: string; user_id: string; title: string; target_amount: number; current_amount: number; currency: "CRC" | "USD"; target_date: string | null; icon: string | null; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id: string; title: string; target_amount: number; current_amount?: number; currency?: "CRC" | "USD"; target_date?: string | null; icon?: string | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string; title?: string; target_amount?: number; current_amount?: number; currency?: "CRC" | "USD"; target_date?: string | null; icon?: string | null; created_at?: string | null; updated_at?: string | null };
      };

      wallet_planned_expenses: {
        Row: { id: string; user_id: string; name: string; category: string; amount: number; currency: "CRC" | "USD"; due_date: string; frequency: "weekly" | "biweekly" | "monthly" | "yearly" | "one_time"; status: "pending" | "paid" | "overdue"; paid_at: string | null; icon: string | null; notes: string | null; enabled: boolean; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id: string; name: string; category: string; amount: number; currency?: "CRC" | "USD"; due_date: string; frequency?: "weekly" | "biweekly" | "monthly" | "yearly" | "one_time"; status?: "pending" | "paid" | "overdue"; paid_at?: string | null; icon?: string | null; notes?: string | null; enabled?: boolean; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string; name?: string; category?: string; amount?: number; currency?: "CRC" | "USD"; due_date?: string; frequency?: "weekly" | "biweekly" | "monthly" | "yearly" | "one_time"; status?: "pending" | "paid" | "overdue"; paid_at?: string | null; icon?: string | null; notes?: string | null; enabled?: boolean; created_at?: string | null; updated_at?: string | null };
      };

      achievement_unlocks: {
        Row: { id: string; user_id: string; achievement_id: string; unlocked_at: string; source_progress: number; metadata: Json; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id: string; achievement_id: string; unlocked_at?: string; source_progress?: number; metadata?: Json; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string; achievement_id?: string; unlocked_at?: string; source_progress?: number; metadata?: Json; created_at?: string | null; updated_at?: string | null };
      };

      guardian_share_tokens: {
        Row: { id: string; user_id: string; token: string; child_alias: string; guardian_label: string; include_calendar: boolean; include_achievements: boolean; include_best_day: boolean; include_streak: boolean; include_wallet: boolean; snapshot: Json; expires_at: string; revoked_at: string | null; last_viewed_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; token: string; child_alias: string; guardian_label: string; include_calendar?: boolean; include_achievements?: boolean; include_best_day?: boolean; include_streak?: boolean; include_wallet?: boolean; snapshot: Json; expires_at: string; revoked_at?: string | null; last_viewed_at?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; user_id?: string; token?: string; child_alias?: string; guardian_label?: string; include_calendar?: boolean; include_achievements?: boolean; include_best_day?: boolean; include_streak?: boolean; include_wallet?: boolean; snapshot?: Json; expires_at?: string; revoked_at?: string | null; last_viewed_at?: string | null; created_at?: string; updated_at?: string };
      };
      wallet_categories: {
        Row: { id: string; user_id: string | null; name: string; type: "income" | "expense" | "saving" | "extra"; color: string; icon: string | null; sort_order: number | null; created_at: string | null; updated_at: string | null };
        Insert: { id?: string; user_id?: string | null; name: string; type: "income" | "expense" | "saving" | "extra"; color?: string; icon?: string | null; sort_order?: number | null; created_at?: string | null; updated_at?: string | null };
        Update: { id?: string; user_id?: string | null; name?: string; type?: "income" | "expense" | "saving" | "extra"; color?: string; icon?: string | null; sort_order?: number | null; created_at?: string | null; updated_at?: string | null };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_guardian_share_by_token: {
        Args: { p_token: string };
        Returns: { status: string; snapshot: Json; expires_at: string; revoked_at: string | null; created_at: string }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
