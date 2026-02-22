import type { User } from '@supabase/supabase-js';

import { supabase_client } from '../../../lib/supabase';

function derive_display_name(user: User): string {
  const full_name = user.user_metadata?.full_name;
  const name = user.user_metadata?.name;
  const email = user.email;

  if (typeof full_name === 'string' && full_name.trim()) {
    return full_name.trim();
  }

  if (typeof name === 'string' && name.trim()) {
    return name.trim();
  }

  if (typeof email === 'string' && email.includes('@')) {
    return email.split('@')[0] ?? 'Player';
  }

  return 'Player';
}

function derive_avatar_url(user: User): string | null {
  const avatar_url = user.user_metadata?.avatar_url;

  if (typeof avatar_url === 'string' && avatar_url.trim()) {
    return avatar_url.trim();
  }

  return null;
}

export async function sync_profile_service(user: User | null): Promise<void> {
  if (!user) {
    return;
  }

  const { error } = await supabase_client.from('profiles').upsert(
    {
      avatar_url: derive_avatar_url(user),
      display_name: derive_display_name(user),
      id: user.id,
    },
    {
      onConflict: 'id',
    },
  );

  if (error) {
    throw error;
  }
}
