import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitCompare, Building2, FileText, ArrowRight, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { partiesData } from '@/data/parties';
import PartyLogo from '@/components/PartyLogo';
import PremiumGate from '@/components/PremiumGate';
import { useSubscription, FREE_LIMITS } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { usePartyByKey } from '@/hooks/useParties';
import { useProposalsByParty, type DbProposal } from '@/hooks/useProposals';

const ProposalCell = ({ proposal }: { proposal?: DbProposal }) => {
  if (!proposal) {
    return <p className="text-sm text-muted-foreground italic">Sem proposta validada nesta categoria.</p>;
  }
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{proposal.title}</p>
      <p className="text-sm text-muted-foreground">{proposal.neutral_summary}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
        {proposal.official_source_url && (
          <a
            href={proposal.official_source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Fonte
          </a>
        )}
        {proposal.source_document_name && <span>{proposal.source_document_name}</span>}
        {proposal.last_verified_date && (
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {new Date(proposal.last_verified_date).toLocaleDateString('pt-PT')}
          </span>
        )}
      </div>
    </div>
  );
};

const Compare = () => {
  const { user } = useAuth();
  const { isPremium, canCompare, comparisonsToday, remainingComparisons, refresh } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();
  const [party1, setParty1] = useState<string>('');
  const [party2, setParty2] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  const { data: dbParty1 } = usePartyByKey(party1 || undefined);
  const { data: dbParty2 } = usePartyByKey(party2 || undefined);
  const { data: proposals1 = [] } = useProposalsByParty(dbParty1?.id);
  const { data: proposals2 = [] } = useProposalsByParty(dbParty2?.id);

  useEffect(() => {
    const state = location.state as { partyIds?: string[] } | null;
    if (state?.partyIds && state.partyIds.length >= 2) {
      setParty1(state.partyIds[0]);
      setParty2(state.partyIds[1]);
      setShowComparison(true);
      navigate('/compare', { replace: true });
    }
  }, [location.state, navigate]);

  const handleCompareParties = async () => {
    if (!party1 || !party2) return;
    if (!canCompare) {
      setGateOpen(true);
      return;
    }
    setShowComparison(true);

    if (user) {
      const [usageRes, historyRes] = await Promise.all([
        supabase.rpc('record_usage', { p_action_type: 'comparison' }),
        supabase
          .from('comparison_history')
          .insert({ user_id: user.id, party_ids: [party1, party2] }),
      ]);
      if (usageRes.error) {
        toast({
          title: 'Aviso',
          description: 'Não foi possível registar a utilização.',
          variant: 'destructive',
        });
      }
      if (historyRes.error) {
        console.error('history insert error', historyRes.error);
      }
      refresh();
    }
  };

  const party1Data = party1 ? partiesData.find((p) => p.id === party1) : null;
  const party2Data = party2 ? partiesData.find((p) => p.id === party2) : null;

  // Union of categories across both parties, alphabetical
  const categories = useMemo(() => {
    const set = new Set<string>();
    proposals1.forEach((p) => set.add(p.category));
    proposals2.forEach((p) => set.add(p.category));
    return Array.from(set).sort();
  }, [proposals1, proposals2]);

  const firstByCategory = (list: DbProposal[], category: string) =>
    list.find((p) => p.category === category);

  return (
    <Layout>
      <PremiumGate
        open={gateOpen}
        onOpenChange={setGateOpen}
        title="Limite diário atingido"
        description={`Já usaste as tuas ${FREE_LIMITS.comparisonsPerDay} comparações de hoje. Faz upgrade para Premium e compara sem limites.`}
      />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="animate-fade-in flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold font-display mb-2 flex items-center gap-3">
              <GitCompare className="w-8 h-8 text-primary" />
              Comparador
            </h1>
            <p className="text-muted-foreground">
              Compara partidos políticos lado a lado, usando apenas propostas validadas com fonte oficial.
            </p>
          </div>
          {!isPremium && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>
                <span className="font-medium">{comparisonsToday}/{FREE_LIMITS.comparisonsPerDay}</span> hoje
                {remainingComparisons === 0 && ' — limite atingido'}
              </span>
            </div>
          )}
        </div>

        <Tabs defaultValue="parties" className="animate-slide-up">
          <TabsList className="grid w-full max-w-md grid-cols-1">
            <TabsTrigger value="parties" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Comparar Partidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parties" className="space-y-6 mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Partido 1</label>
                    <Select value={party1} onValueChange={(v) => { setParty1(v); setShowComparison(false); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar partido" />
                      </SelectTrigger>
                      <SelectContent>
                        {partiesData.map((party) => (
                          <SelectItem key={party.id} value={party.id} disabled={party.id === party2}>
                            <div className="flex items-center gap-2">
                              <PartyLogo src={party.logo} alt={party.abbreviation} size="xs" />
                              {party.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90 md:rotate-0" />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Partido 2</label>
                    <Select value={party2} onValueChange={(v) => { setParty2(v); setShowComparison(false); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar partido" />
                      </SelectTrigger>
                      <SelectContent>
                        {partiesData.map((party) => (
                          <SelectItem key={party.id} value={party.id} disabled={party.id === party1}>
                            <div className="flex items-center gap-2">
                              <PartyLogo src={party.logo} alt={party.abbreviation} size="xs" />
                              {party.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleCompareParties}
                    disabled={!party1 || !party2}
                  >
                    <GitCompare className="w-4 h-4 mr-2" />
                    Comparar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {showComparison && party1Data && party2Data && categories.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Ainda não existem propostas validadas para comparar entre estes partidos.
                </CardContent>
              </Card>
            )}

            {showComparison && party1Data && party2Data && categories.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6 animate-scale-in">
                {categories.map((category) => (
                  <Card key={category} className="md:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-secondary/50">
                          <div className="flex items-center gap-2 mb-2">
                            <PartyLogo src={party1Data.logo} alt={party1Data.abbreviation} size="sm" />
                            <span className="font-medium text-sm">{party1Data.abbreviation}</span>
                          </div>
                          <ProposalCell proposal={firstByCategory(proposals1, category)} />
                        </div>
                        <div className="p-4 rounded-xl bg-secondary/50">
                          <div className="flex items-center gap-2 mb-2">
                            <PartyLogo src={party2Data.logo} alt={party2Data.abbreviation} size="sm" />
                            <span className="font-medium text-sm">{party2Data.abbreviation}</span>
                          </div>
                          <ProposalCell proposal={firstByCategory(proposals2, category)} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Compare;
