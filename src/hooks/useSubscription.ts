import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const FREE_LIMITS = {
  comparisonsPerDay: 3,
  favorites: 5,
} as const;

type Tier = 'free' | 'premium';

interface SubscriptionState {
  tier: Tier;
  isPremium: boolean;
  loading: boolean;
  comparisonsToday: number;
  favoritesCount: number;
  remainingComparisons: number;
  remainingFavorites: number;
  canCompare: boolean;
  canFavorite: boolean;
  refresh: () => Promise<void>;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [tier, setTier] = useState<Tier>('free');
  const [comparisonsToday, setComparisonsToday] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setTier('free');
      setComparisonsToday(0);
      setFavoritesCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [profileRes, usageRes, favRes] = await Promise.all([
      supabase.from('profiles').select('subscription_tier').eq('user_id', user.id).maybeSingle(),
      supabase
        .from('usage_tracking')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action_type', 'comparison')
        .gte('used_at', startOfDay.toISOString()),
      supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);

    setTier((profileRes.data?.subscription_tier as Tier) ?? 'free');
    setComparisonsToday(usageRes.count ?? 0);
    setFavoritesCount(favRes.count ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const isPremium = tier === 'premium';
  const remainingComparisons = isPremium
    ? Infinity
    : Math.max(0, FREE_LIMITS.comparisonsPerDay - comparisonsToday);
  const remainingFavorites = isPremium
    ? Infinity
    : Math.max(0, FREE_LIMITS.favorites - favoritesCount);

  return {
    tier,
    isPremium,
    loading,
    comparisonsToday,
    favoritesCount,
    remainingComparisons,
    remainingFavorites,
    canCompare: isPremium || remainingComparisons > 0,
    canFavorite: isPremium || remainingFavorites > 0,
    refresh: load,
  };
}
