import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const FREE_LIMITS = {
  comparisonsPerDay: 3,
  favorites: 5,
  aiChatPerDay: 1,
} as const;

type Tier = 'free' | 'premium';
type Status = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | null;

interface SubscriptionState {
  tier: Tier;
  status: Status;
  periodEnd: string | null;
  isPremium: boolean;
  loading: boolean;
  comparisonsToday: number;
  aiChatsToday: number;
  favoritesCount: number;
  remainingComparisons: number;
  remainingFavorites: number;
  remainingAiChats: number;
  canCompare: boolean;
  canFavorite: boolean;
  canUseAi: boolean;
  refresh: () => Promise<void>;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [tier, setTier] = useState<Tier>('free');
  const [status, setStatus] = useState<Status>(null);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [comparisonsToday, setComparisonsToday] = useState(0);
  const [aiChatsToday, setAiChatsToday] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setTier('free');
      setStatus(null);
      setPeriodEnd(null);
      setComparisonsToday(0);
      setAiChatsToday(0);
      setFavoritesCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [profileRes, compRes, aiRes, favRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, subscription_period_end')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('usage_tracking')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action_type', 'comparison')
        .gte('used_at', startOfDay.toISOString()),
      supabase
        .from('usage_tracking')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action_type', 'ai_chat')
        .gte('used_at', startOfDay.toISOString()),
      supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);

    setTier((profileRes.data?.subscription_tier as Tier) ?? 'free');
    setStatus((profileRes.data?.subscription_status as Status) ?? null);
    setPeriodEnd(profileRes.data?.subscription_period_end ?? null);
    setComparisonsToday(compRes.count ?? 0);
    setAiChatsToday(aiRes.count ?? 0);
    setFavoritesCount(favRes.count ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Premium is only valid if: tier=premium AND status active/trialing AND period_end in the future
  const statusOk = status === 'active' || status === 'trialing';
  const periodOk = !periodEnd || new Date(periodEnd).getTime() > Date.now();
  const isPremium = tier === 'premium' && statusOk && periodOk;
  const remainingComparisons = isPremium
    ? Infinity
    : Math.max(0, FREE_LIMITS.comparisonsPerDay - comparisonsToday);
  const remainingFavorites = isPremium
    ? Infinity
    : Math.max(0, FREE_LIMITS.favorites - favoritesCount);
  const remainingAiChats = isPremium
    ? Infinity
    : Math.max(0, FREE_LIMITS.aiChatPerDay - aiChatsToday);

  return {
    tier,
    status,
    periodEnd,
    isPremium,
    loading,
    comparisonsToday,
    aiChatsToday,
    favoritesCount,
    remainingComparisons,
    remainingFavorites,
    remainingAiChats,
    canCompare: isPremium || remainingComparisons > 0,
    canFavorite: isPremium || remainingFavorites > 0,
    canUseAi: isPremium || remainingAiChats > 0,
    refresh: load,
  };
}
