import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

interface ParsedJokeCandidate {
  punchline: string;
  setup: string;
  source_api_id: string;
}

interface FallbackJokeRow {
  id: string;
  setup: string;
  punchline: string;
}

type ReleaseSlot = 'AM' | 'PM';

const response_headers = {
  'content-type': 'application/json; charset=utf-8',
};

const default_joke_api_url = 'https://official-joke-api.appspot.com/jokes/random';

const in_memory_fallback_jokes: Array<{ setup: string; punchline: string }> = [
  {
    setup: 'Why did the scarecrow win an award?',
    punchline: 'Because he was outstanding in his field.',
  },
  {
    setup: 'What do you call fake spaghetti?',
    punchline: 'An impasta.',
  },
  {
    setup: 'Why do cows wear bells?',
    punchline: 'Because their horns do not work.',
  },
  {
    setup: 'Why could the bicycle not stand up by itself?',
    punchline: 'It was two-tired.',
  },
];

function json_response(body: JsonValue, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: response_headers,
    status,
  });
}

function normalize_whitespace(raw_text: string): string {
  return raw_text.replace(/\s+/g, ' ').trim();
}

function format_utc_date_key(date_value: Date): string {
  return date_value.toISOString().slice(0, 10);
}

function get_utc_release_slot(date_value: Date): ReleaseSlot {
  return date_value.getUTCHours() < 12 ? 'AM' : 'PM';
}

function parse_question_answer_text(raw_text: string): ParsedJokeCandidate | null {
  const normalized_text = normalize_whitespace(raw_text);
  const question_mark_index = normalized_text.indexOf('?');

  if (!normalized_text || question_mark_index < 0) {
    return null;
  }

  const setup = normalized_text.slice(0, question_mark_index + 1).trim();
  const punchline = normalized_text.slice(question_mark_index + 1).trim();

  if (!setup.endsWith('?') || !punchline) {
    return null;
  }

  return {
    punchline,
    setup,
    source_api_id: `text-${crypto.randomUUID()}`,
  };
}

function parse_provider_payload(payload: unknown): ParsedJokeCandidate | null {
  if (Array.isArray(payload)) {
    for (const row of payload) {
      const parsed_array_row = parse_provider_payload(row);
      if (parsed_array_row) {
        return parsed_array_row;
      }
    }
    return null;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const row = payload as Record<string, unknown>;

  const setup_value = row.setup;
  const punchline_value = row.punchline;

  if (typeof setup_value === 'string' && typeof punchline_value === 'string') {
    const normalized_setup = normalize_whitespace(setup_value);
    const normalized_punchline = normalize_whitespace(punchline_value);
    const question_mark_index = normalized_setup.indexOf('?');

    if (question_mark_index < 0 || !normalized_punchline) {
      return null;
    }

    const question_setup = normalized_setup.slice(0, question_mark_index + 1).trim();

    if (!question_setup.endsWith('?')) {
      return null;
    }

    return {
      punchline: normalized_punchline,
      setup: question_setup,
      source_api_id:
        typeof row.id === 'string' || typeof row.id === 'number'
          ? String(row.id)
          : `api-${crypto.randomUUID()}`,
    };
  }

  const joke_text_value = row.joke;
  if (typeof joke_text_value === 'string') {
    return parse_question_answer_text(joke_text_value);
  }

  const nested_value = row.value;
  if (nested_value && typeof nested_value === 'object') {
    return parse_provider_payload(nested_value);
  }

  return null;
}

function coerce_explicit_setup_punchline(
  setup_value: string,
  punchline_value: string,
  source_api_id: string,
): ParsedJokeCandidate | null {
  const normalized_setup = normalize_whitespace(setup_value);
  const normalized_punchline = normalize_whitespace(punchline_value);
  const question_mark_index = normalized_setup.indexOf('?');

  if (question_mark_index < 0 || !normalized_punchline) {
    return null;
  }

  const question_setup = normalized_setup.slice(0, question_mark_index + 1).trim();

  if (!question_setup.endsWith('?')) {
    return null;
  }

  return {
    punchline: normalized_punchline,
    setup: question_setup,
    source_api_id,
  };
}

function get_query_bool(url: URL, key: string): boolean {
  const raw_value = url.searchParams.get(key);
  return raw_value === '1' || raw_value === 'true';
}

function get_target_joke_date(url: URL): string {
  const provided_date = url.searchParams.get('date');

  if (!provided_date) {
    return format_utc_date_key(new Date());
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(provided_date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD.');
  }

  return provided_date;
}

function get_target_release_slot(url: URL): ReleaseSlot {
  const provided_slot = url.searchParams.get('slot');

  if (!provided_slot) {
    return get_utc_release_slot(new Date());
  }

  if (provided_slot !== 'AM' && provided_slot !== 'PM') {
    throw new Error('Invalid slot format. Use AM or PM.');
  }

  return provided_slot;
}

async function fetch_question_answer_joke_from_api(): Promise<ParsedJokeCandidate | null> {
  const joke_api_url = Deno.env.get('JOKE_API_URL') ?? default_joke_api_url;
  const max_attempts = Number(Deno.env.get('JOKE_API_MAX_ATTEMPTS') ?? '8');

  for (let attempt = 1; attempt <= max_attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout_id = setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch(joke_api_url, {
        headers: {
          accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as unknown;
      const parsed_candidate = parse_provider_payload(payload);

      if (parsed_candidate) {
        return parsed_candidate;
      }
    } catch (_error) {
      // Continue to next attempt or fallback.
    } finally {
      clearTimeout(timeout_id);
    }
  }

  return null;
}

function pick_random_fallback_row(rows: FallbackJokeRow[]): FallbackJokeRow | null {
  if (!rows.length) {
    return null;
  }

  const random_index = Math.floor(Math.random() * rows.length);
  return rows[random_index] ?? null;
}

async function fetch_fallback_joke(
  supabase_admin: ReturnType<typeof createClient>,
): Promise<ParsedJokeCandidate> {
  const { data, error } = await supabase_admin
    .from('fallback_jokes')
    .select('id, setup, punchline')
    .eq('is_active', true)
    .limit(200);

  if (!error && Array.isArray(data)) {
    const fallback_row = pick_random_fallback_row(data as FallbackJokeRow[]);

    if (fallback_row) {
      const parsed_fallback_joke = coerce_explicit_setup_punchline(
        fallback_row.setup,
        fallback_row.punchline,
        `fallback:${fallback_row.id}`,
      );

      if (parsed_fallback_joke) {
        return parsed_fallback_joke;
      }
    }
  }

  const memory_fallback_row =
    in_memory_fallback_jokes[
      Math.floor(Math.random() * in_memory_fallback_jokes.length)
    ] ?? in_memory_fallback_jokes[0];

  return (
    coerce_explicit_setup_punchline(
      memory_fallback_row.setup,
      memory_fallback_row.punchline,
      'fallback:in-memory',
    ) ?? {
      punchline: 'Because their horns do not work.',
      setup: 'Why do cows wear bells?',
      source_api_id: 'fallback:in-memory-default',
    }
  );
}

Deno.serve(async (request) => {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return json_response({ error: 'Method not allowed.' }, 405);
  }

  const supabase_url = Deno.env.get('SUPABASE_URL');
  const service_role_key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabase_url || !service_role_key) {
    return json_response(
      { error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.' },
      500,
    );
  }

  const supabase_admin = createClient(supabase_url, service_role_key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const request_url = new URL(request.url);

  let target_joke_date: string;
  let target_release_slot: ReleaseSlot;
  try {
    target_joke_date = get_target_joke_date(request_url);
    target_release_slot = get_target_release_slot(request_url);
  } catch (error) {
    return json_response(
      { error: error instanceof Error ? error.message : 'Invalid request.' },
      400,
    );
  }

  const force_refresh = get_query_bool(request_url, 'force');

  if (!force_refresh) {
    const { data: existing_joke, error: existing_joke_error } = await supabase_admin
      .from('daily_jokes')
      .select('id, joke_date, release_slot, setup, source_api_id')
      .eq('joke_date', target_joke_date)
      .eq('release_slot', target_release_slot)
      .maybeSingle();

    if (existing_joke_error) {
      return json_response(
        { error: existing_joke_error.message, stage: 'read-existing-joke' },
        500,
      );
    }

    if (existing_joke) {
      return json_response({
        data: existing_joke,
        source: 'existing',
      });
    }
  }

  const api_joke = await fetch_question_answer_joke_from_api();
  const selected_joke = api_joke ?? (await fetch_fallback_joke(supabase_admin));
  const joke_source = api_joke ? 'api' : 'fallback';

  const { data: saved_joke, error: upsert_error } = await supabase_admin
    .from('daily_jokes')
    .upsert(
      {
        joke_date: target_joke_date,
        punchline: selected_joke.punchline,
        release_slot: target_release_slot,
        setup: selected_joke.setup,
        source_api_id: selected_joke.source_api_id,
      },
      {
        onConflict: 'joke_date,release_slot',
      },
    )
    .select('id, joke_date, release_slot, setup, source_api_id')
    .single();

  if (upsert_error) {
    return json_response(
      { error: upsert_error.message, stage: 'upsert-daily-joke' },
      500,
    );
  }

  return json_response({
    data: saved_joke,
    source: joke_source,
  });
});
