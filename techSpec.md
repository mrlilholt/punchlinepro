# Technical Specification: Punchline Pro (Production MVP)

@AI_AGENT: This document is the definitive Source of Truth. You are required to update the Implementation Plan and Decision Log as you execute tasks. Do not deviate from the Schema or Security Rules without explicit authorization.

## 1. Executive Summary
Punchline Pro is a daily asynchronous social game. It solves the "fragmented email chain" problem by providing a centralized, competitive platform for friends to solve daily jokes.

## 2. Strategic Clarity
- **Primary User:** Non-technical but "clever" demographic (Dads).
- **Core Transformation:** Users move from passive joke recipients to active participants in a daily intellectual ritual.
- **Success Metric:** Daily Active Users (DAU) stability over a 14-day pilot with 5 users.

## 3. Detailed Architecture & Stack
- **Frontend:** React 19 (Hooks/Functional), Vite, Tailwind CSS 4.0.
- **Backend:** Supabase (PostgreSQL 15+).
- **Authentication:** Google OAuth 2.0 via Supabase GoTrue.
- **Realtime:** Supabase Realtime (Broadcast) for the "Live Guess Feed."
- **Fuzzy Matching:** PostgreSQL `pg_trgm` extension for trigram similarity.

## 4. Data Model (Postgres)

### 4.1 Tables
- **profiles** (Public)
  - `id`: uuid (PK, references auth.users)
  - `display_name`: text
  - `avatar_url`: text
  - `total_score`: int (default 0)
- **daily_jokes**
  - `id`: uuid (PK)
  - `joke_date`: date (Unique, Index)
  - `setup`: text
  - `punchline`: text
  - `source_api_id`: text
- **guesses**
  - `id`: uuid (PK)
  - `user_id`: uuid (FK -> profiles)
  - `joke_date`: date (FK -> daily_jokes)
  - `guess_text`: text
  - `is_correct`: boolean
  - `similarity_score`: float8
  - `created_at`: timestamptz

## 5. Security & Row Level Security (RLS)
- **Profiles:** `select` is public; `update` only if `id == auth.uid()`.
- **Daily Jokes:** `select` is public.
- **Guesses:** - `insert`: Only if `auth.uid()` matches `user_id`.
  - `select`: Users can ONLY see other users' guesses for `joke_date` IF they have a record in `guesses` where `user_id == auth.uid()` AND `joke_date == CURRENT_DATE`.

## 6. Functional Workflows
1. **The Daily Fetch:** A Supabase Edge Function runs on a CRON schedule (00:00 UTC) to fetch a joke. If the API fails, it selects a random joke from a `fallback_jokes` table.
2. **The "Smart" Evaluation:** Logic is handled via a Postgres Function `check_guess_similarity(user_guess, correct_punchline)`.
3. **The Reveal:** The UI remains in "Input Mode" until a guess is submitted. Post-submission, the UI switches to "Results Mode," fetching the Realtime stream of other guesses.

## 7. Implementation Roadmap
- [ ] **Sprint 1: Infrastructure.** Supabase project init, SQL migrations for tables, and Google OAuth config.
- [ ] **Sprint 2: Logic Layer.** Implement `pg_trgm` similarity function and the "Daily Gate" RLS rules.
- [ ] **Sprint 3: Core UI.** Mobile-first React components: `JokeCard`, `GuessInput`, `Leaderboard`.
- [ ] **Sprint 4: Social.** Realtime guess feed integration and "Fuzzy Result" animations.