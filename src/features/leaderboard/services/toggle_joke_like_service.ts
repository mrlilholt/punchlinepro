import { supabase_client } from '../../../lib/supabase';

interface ToggleJokeLikeParams {
  isLiked: boolean;
  jokeId: string;
  userId: string;
}

export async function toggle_joke_like_service({
  isLiked,
  jokeId,
  userId,
}: ToggleJokeLikeParams): Promise<void> {
  if (isLiked) {
    const { error } = await supabase_client
      .from('joke_likes')
      .delete()
      .eq('joke_id', jokeId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase_client.from('joke_likes').upsert(
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
