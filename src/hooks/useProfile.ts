import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileData {
  display_name: string | null;
  avatar_url: string | null; // signed URL (or null)
  avatar_path: string | null; // storage path inside the avatars bucket
}

const EVENT = 'bepolitic:profile-updated';
const SIGNED_URL_TTL = 60 * 60; // 1 hour

export function emitProfileUpdated() {
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Resolves the stored `avatar_url` column into a usable image URL.
 * - If the value looks like a storage path (e.g. "<userId>/avatar-...jpg"),
 *   we generate a short-lived signed URL scoped to that user.
 * - We refuse to sign paths that don't belong to the current user.
 * - Legacy public URLs are ignored (bucket is now private).
 */
async function resolveAvatar(
  rawValue: string | null,
  userId: string,
): Promise<{ url: string | null; path: string | null }> {
  if (!rawValue) return { url: null, path: null };

  // Treat anything that doesn't look like an http(s) URL as a storage path.
  const isHttp = /^https?:\/\//i.test(rawValue);
  if (isHttp) {
    // Legacy public URL — try to extract the storage path; otherwise drop it.
    const match = rawValue.match(/\/avatars\/(.+?)(?:\?|$)/);
    if (!match) return { url: null, path: null };
    rawValue = decodeURIComponent(match[1]);
  }

  const path = rawValue;

  // Only sign avatars that belong to the authenticated user.
  if (!path.startsWith(`${userId}/`)) {
    return { url: null, path: null };
  }

  const { data, error } = await supabase.storage
    .from('avatars')
    .createSignedUrl(path, SIGNED_URL_TTL);

  if (error || !data?.signedUrl) {
    return { url: null, path };
  }
  return { url: data.signedUrl, path };
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { url, path } = await resolveAvatar(data.avatar_url ?? null, user.id);
    setProfile({
      display_name: data.display_name,
      avatar_url: url,
      avatar_path: path,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [load]);

  return { profile, loading, refresh: load };
}
