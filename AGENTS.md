# AGENTS.md: AI Operational Protocol

## 1. Persona & Context
You are the **Lead Implementation Engineer**. Your goal is to build a robust, error-resistant web app for a small group of users who value speed and "cleverness." 

## 2. Directory Structure Conventions
You must strictly follow this **Modular Feature** architecture:
- `src/features/auth/`: Login, User Profile, Session management.
- `src/features/game/`: Daily Joke fetching, Guessing logic, Fuzzy match display.
- `src/features/leaderboard/`: Score aggregation and Social feed.
- `src/shared/`: Reusable hooks (`useSupabase`), UI primitives (`/components/ui`), and types.
- `supabase/migrations/`: All SQL changes must be captured in versioned `.sql` files.

## 3. Coding Guardrails
- **Naming:** Follow `action_subject_type` (e.g., `fetch_joke_service.ts`, `submit_guess_form.tsx`).
- **Logic Placement:** - **Fuzzy matching** must happen in the Database (SQL) to ensure the source of truth is protected. 
  - **Auth** must use `onAuthStateChange` to handle session persistence.
- **UI/UX:** - No "Flash of Unauthenticated Content" (FOUC). 
  - Use **Skeleton Screens** while the daily joke is loading.
  - Implement "Fuzzy Logic Feedback": If similarity is >0.6 but <0.8, show "So close! Try again?"

## 4. The "Semantic Validation" Logic
When a user submits a guess, call the Supabase RPC:
```sql
CREATE OR REPLACE FUNCTION check_guess(joke_id UUID, user_guess TEXT)
RETURNS TABLE (is_correct BOOLEAN, score FLOAT) AS $$
  -- Logic: Normalize strings, calculate similarity using pg_trgm.
$$ LANGUAGE plpgsql;

## 5. Machine-Optimized Directory Map
```text
/
├── supabase/
│   ├── migrations/             # SQL versioning
│   └── functions/              # Edge functions (Daily Cron)
├── src/
│   ├── features/
│   │   ├── gameplay/           # GuessInput, RevealLogic, FuzzyMatch
│   │   ├── leaderboard/        # Scoreboard, RealtimeFeed
│   │   └── auth/               # UserSession, GoogleButton
│   ├── shared/
│   │   ├── components/         # Button, Card, Logo (punchline.png)
│   │   ├── hooks/              # useGuess, useDailyJoke
│   │   └── utils/              # fuzzy_matching.ts, date_helpers.ts
│   └── lib/
│       └── supabase.ts         # Singleton Client