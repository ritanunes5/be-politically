import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type FavoriteType = 'party' | 'topic' | 'proposal';

interface FavoriteRow {
  id: string;
  item_id: string;
  item_type: string;
}

const EVENT = 'bepolitic:favorites-updated';

export function emitFavoritesUpdated() {
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Hook to load and manage the current user's favorites.
 * Returns the full list and helpers to toggle/check items.
 */
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('favorites')
      .select('id, item_id, item_type')
      .eq('user_id', user.id);
    if (!error && data) setFavorites(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [load]);

  const isFavorite = useCallback(
    (itemId: string, itemType: FavoriteType) =>
      favorites.some((f) => f.item_id === itemId && f.item_type === itemType),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (itemId: string, itemType: FavoriteType) => {
      if (!user) {
        toast.error('Inicia sessão para guardar favoritos.');
        return false;
      }
      const existing = favorites.find(
        (f) => f.item_id === itemId && f.item_type === itemType,
      );
      if (existing) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existing.id)
          .eq('user_id', user.id);
        if (error) {
          toast.error('Não foi possível remover o favorito.');
          return false;
        }
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
        emitFavoritesUpdated();
        toast.success('Removido dos favoritos');
        return false;
      }
      const { data, error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, item_id: itemId, item_type: itemType })
        .select('id, item_id, item_type')
        .single();
      if (error) {
        const msg = /limit/i.test(error.message)
          ? 'Atingiste o limite gratuito de favoritos.'
          : 'Não foi possível adicionar aos favoritos.';
        toast.error(msg);
        return false;
      }
      if (data) {
        setFavorites((prev) => [...prev, data]);
        emitFavoritesUpdated();
        toast.success('Adicionado aos favoritos');
      }
      return true;
    },
    [favorites, user],
  );

  return { favorites, loading, isFavorite, toggleFavorite, refresh: load };
}
