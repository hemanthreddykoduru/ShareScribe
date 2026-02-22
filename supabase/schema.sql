-- ShareScribe Database Schema
-- Run this in your Supabase SQL Editor to set up the database.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  avatar_url      TEXT,
  plan            TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  storage_used    BIGINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"    ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PDFS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pdfs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  slug            TEXT NOT NULL UNIQUE,
  file_url        TEXT NOT NULL,
  file_path       TEXT NOT NULL,
  visibility      TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  password_hash   TEXT,
  expires_at      TIMESTAMPTZ,
  view_count      BIGINT NOT NULL DEFAULT 0,
  download_count  BIGINT NOT NULL DEFAULT 0,
  folder          TEXT,
  size_bytes      BIGINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pdfs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public PDFs visible to all"    ON public.pdfs FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);
CREATE POLICY "Users can insert own PDFs"     ON public.pdfs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own PDFs"     ON public.pdfs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own PDFs"     ON public.pdfs FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS pdfs_user_id_idx ON public.pdfs(user_id);
CREATE INDEX IF NOT EXISTS pdfs_slug_idx    ON public.pdfs(slug);

-- ============================================================
-- QR CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pdf_id      UUID REFERENCES public.pdfs(id) ON DELETE SET NULL,
  type        TEXT NOT NULL CHECK (type IN ('pdf_url', 'custom_url', 'text', 'vcard')),
  data        TEXT NOT NULL,
  config      JSONB NOT NULL DEFAULT '{}',
  scan_count  BIGINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own QR codes" ON public.qr_codes FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- ANALYTICS EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pdf_id      UUID NOT NULL REFERENCES public.pdfs(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL CHECK (event_type IN ('view', 'download', 'qr_scan')),
  ip_hash     TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics (for unauthenticated views)
CREATE POLICY "Anyone can insert analytics"  ON public.analytics_events FOR INSERT WITH CHECK (true);
-- Only PDF owner can view analytics
CREATE POLICY "PDF owners can view analytics" ON public.analytics_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.pdfs WHERE pdfs.id = pdf_id AND pdfs.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS analytics_pdf_id_idx    ON public.analytics_events(pdf_id);
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON public.analytics_events(created_at);

-- ============================================================
-- STORAGE BUCKETS (configure in Supabase dashboard)
-- ============================================================
-- 1. Create a bucket called "pdfs" (public — for direct URL access)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', true);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_view_count(pdf_id_arg UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.pdfs SET view_count = view_count + 1 WHERE id = pdf_id_arg;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_download_count(pdf_id_arg UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.pdfs SET download_count = download_count + 1 WHERE id = pdf_id_arg;
END;
$$;

