export type Json =
  | boolean
  | null
  | number
  | string
  | Json[]
  | { [key: string]: Json | undefined };

export interface Database {
  public: {
    Enums: {
      event_frequency_unit: "daily" | "weekly" | "annual";
      event_type: "punctual" | "recurring";
      family_member_role: "owner" | "member" | "delegated";
      recurring_event_category: "work" | "studies" | "other";
      shift_type: "morning" | "day" | "afternoon" | "night";
    };
    Tables: {
      event_exceptions: {
        Insert: {
          created_at?: string;
          event_id: string;
          exception_date: string;
          id?: string;
          is_deleted?: boolean;
          override_data?: Json | null;
        };
        Row: {
          created_at: string;
          event_id: string;
          exception_date: string;
          id: string;
          is_deleted: boolean;
          override_data: Json | null;
        };
        Update: {
          created_at?: string;
          event_id?: string;
          exception_date?: string;
          id?: string;
          is_deleted?: boolean;
          override_data?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "event_exceptions_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Insert: {
          category?:
            | Database["public"]["Enums"]["recurring_event_category"]
            | null;
          created_at?: string;
          created_by: string;
          description?: string | null;
          end_date?: string | null;
          end_time?: string | null;
          event_date?: string | null;
          event_type: Database["public"]["Enums"]["event_type"];
          family_id: string;
          frequency_interval?: number | null;
          frequency_unit?:
            | Database["public"]["Enums"]["event_frequency_unit"]
            | null;
          id?: string;
          parent_event_id?: string | null;
          shift_type?: Database["public"]["Enums"]["shift_type"] | null;
          start_date?: string | null;
          start_time?: string | null;
          title: string;
          updated_at?: string;
        };
        Row: {
          category:
            | Database["public"]["Enums"]["recurring_event_category"]
            | null;
          created_at: string;
          created_by: string;
          description: string | null;
          end_date: string | null;
          end_time: string | null;
          event_date: string | null;
          event_type: Database["public"]["Enums"]["event_type"];
          family_id: string;
          frequency_interval: number | null;
          frequency_unit:
            | Database["public"]["Enums"]["event_frequency_unit"]
            | null;
          id: string;
          parent_event_id: string | null;
          shift_type: Database["public"]["Enums"]["shift_type"] | null;
          start_date: string | null;
          start_time: string | null;
          title: string;
          updated_at: string;
        };
        Update: {
          category?:
            | Database["public"]["Enums"]["recurring_event_category"]
            | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          end_date?: string | null;
          end_time?: string | null;
          event_date?: string | null;
          event_type?: Database["public"]["Enums"]["event_type"];
          family_id?: string;
          frequency_interval?: number | null;
          frequency_unit?:
            | Database["public"]["Enums"]["event_frequency_unit"]
            | null;
          id?: string;
          parent_event_id?: string | null;
          shift_type?: Database["public"]["Enums"]["shift_type"] | null;
          start_date?: string | null;
          start_time?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_parent_event_id_fkey";
            columns: ["parent_event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      families: {
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "families_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      family_members: {
        Insert: {
          color_palette?: string | null;
          delegated_by_user_id?: string | null;
          family_id: string;
          id?: string;
          joined_at?: string;
          role: Database["public"]["Enums"]["family_member_role"];
          user_id: string;
        };
        Row: {
          color_palette: string | null;
          delegated_by_user_id: string | null;
          family_id: string;
          id: string;
          joined_at: string;
          role: Database["public"]["Enums"]["family_member_role"];
          user_id: string;
        };
        Update: {
          color_palette?: string | null;
          delegated_by_user_id?: string | null;
          family_id?: string;
          id?: string;
          joined_at?: string;
          role?: Database["public"]["Enums"]["family_member_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "family_members_delegated_by_user_id_fkey";
            columns: ["delegated_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "family_members_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "family_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          delegated_by_user_id?: string | null;
          display_name: string;
          email: string;
          id: string;
          updated_at?: string;
        };
        Row: {
          avatar_url: string | null;
          created_at: string;
          delegated_by_user_id: string | null;
          display_name: string;
          email: string;
          id: string;
          updated_at: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          delegated_by_user_id?: string | null;
          display_name?: string;
          email?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_delegated_by_user_id_fkey";
            columns: ["delegated_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type FamilyMemberRow =
  Database["public"]["Tables"]["family_members"]["Row"];
export type FamilyRow = Database["public"]["Tables"]["families"]["Row"];
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
