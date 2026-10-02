import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbProposal {
  id: string;
  party_id: string;
  category: string;
  title: string;
  neutral_summary: string;
  official_source_url: string | null;
  source_document_name: string | null;
  last_verified_date: string | null;
  last_verified_at?: string | null;
  source_name?: string | null;
  status?: string;
  source_page?: number | null;
  is_validated: boolean;
  created_at: string;
}

export const useProposalsByParty = (partyId: string | undefined) =>
  useQuery({
    queryKey: ['proposals', partyId],
    enabled: !!partyId,
    queryFn: async (): Promise<DbProposal[]> => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('party_id', partyId!)
        .eq('is_validated', true)
        .order('category');
      if (error) throw error;
      return data ?? [];
    },
  });

export const groupByCategory = (proposals: DbProposal[]) => {
  const map = new Map<string, DbProposal[]>();
  for (const p of proposals) {
    if (!map.has(p.category)) map.set(p.category, []);
    map.get(p.category)!.push(p);
  }
  return Array.from(map.entries()); // [[category, proposals[]]]
};

export const useProposalsByCategories = (categories: string[]) =>
  useQuery({
    queryKey: ['proposals', 'categories', [...categories].sort()],
    enabled: categories.length > 0,
    queryFn: async (): Promise<DbProposal[]> => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .in('category', categories)
        .eq('is_validated', true)
        .order('category');
      if (error) throw error;
      return data ?? [];
    },
  });
