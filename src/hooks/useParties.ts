import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbParty {
  id: string;
  existing_party_key: string;
  name: string;
  acronym: string;
  short_neutral_description: string | null;
  official_website: string | null;
  logo_url: string | null;
  last_verified_date: string | null;
  electoral_program_url?: string | null;
  electoral_program_name?: string | null;
  electoral_program_year?: number | null;
}

export const useParties = () =>
  useQuery({
    queryKey: ['parties'],
    queryFn: async (): Promise<DbParty[]> => {
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
  });

export const usePartyByKey = (key: string | undefined) =>
  useQuery({
    queryKey: ['party', key],
    enabled: !!key,
    queryFn: async (): Promise<DbParty | null> => {
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('existing_party_key', key!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
