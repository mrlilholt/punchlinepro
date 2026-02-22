import { supabase_client } from '../../../lib/supabase';

interface ToggleJokeFavoriteParams {
  isFavorited: boolean;
  jokeId: string;
  userId: string;
}

export async function toggle_joke_favorite_service({
  isFavorited,
  jokeId,
  userId,
}: ToggleJokeFavoriteParams): Promise<void> {
  if (isFavorited) {
    const { error } = await supabase_client
      .from('joke_favorites')
      .delete()
      .eq('joke_id', jokeId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase_client.from('joke_favorites').upsert(
    {
      joke_id: jokeId,
      user_id: userId,
    },
    {
      onConflict: 'user_id,joke_id',
    },
  );

  if (error) {
    throw error;
  }
}
