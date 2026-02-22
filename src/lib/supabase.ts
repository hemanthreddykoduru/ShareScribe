import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — use this in Client Components
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton for convenience in client components
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: 'free' | 'pro';
          storage_used: number;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro';
          storage_used?: number;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro';
          storage_used?: number;
        };
      };
      pdfs: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          tags: string[];
          slug: string;
          file_url: string;
          file_path: string;
          visibility: 'public' | 'private';
          password_hash: string | null;
          expires_at: string | null;
          view_count: number;
          download_count: number;
          folder: string | null;
          size_bytes: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          tags?: string[];
          slug: string;
          file_url: string;
          file_path: string;
          visibility?: 'public' | 'private';
          password_hash?: string | null;
          expires_at?: string | null;
          folder?: string | null;
          size_bytes?: number;
        };
        Update: {
          title?: string;
          description?: string | null;
          tags?: string[];
          visibility?: 'public' | 'private';
          password_hash?: string | null;
          expires_at?: string | null;
          folder?: string | null;
          view_count?: number;
          download_count?: number;
        };
      };
      qr_codes: {
        Row: {
          id: string;
          user_id: string;
          pdf_id: string | null;
          type: 'pdf_url' | 'custom_url' | 'text' | 'vcard';
          data: string;
          config: Record<string, unknown>;
          scan_count: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          pdf_id?: string | null;
          type: 'pdf_url' | 'custom_url' | 'text' | 'vcard';
          data: string;
          config?: Record<string, unknown>;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          pdf_id: string;
          event_type: 'view' | 'download' | 'qr_scan';
          created_at: string;
          ip_hash: string | null;
        };
        Insert: {
          pdf_id: string;
          event_type: 'view' | 'download' | 'qr_scan';
          ip_hash?: string | null;
        };
      };
    };
  };
};
