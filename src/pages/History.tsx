import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History as HistoryIcon, Trash2, GitCompare, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { partiesData } from '@/data/parties';
import PartyLogo from '@/components/PartyLogo';
import { toast } from '@/hooks/use-toast';

interface HistoryItem {
  id: string;
  party_ids: string[];
  criteria: string[] | null;
  notes: string | null;
  created_at: string;
}

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('comparison_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Erro a carregar histórico', description: error.message, variant: 'destructive' });
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const remove = async (id: string) => {
    const { error } = await supabase.from('comparison_history').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro a remover', description: error.message, variant: 'destructive' });
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: 'Comparação removida do histórico' });
  };

  const reopen = (item: HistoryItem) => {
    navigate('/compare', { state: { partyIds: item.party_ids } });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold font-display mb-2 flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-primary" />
            Histórico de Comparações
          </h1>
          <p className="text-muted-foreground">
            Todas as comparações que guardaste, prontas para reabrir.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">A carregar...</div>
        ) : items.length === 0 ? (
          <Card className="animate-slide-up">
            <CardContent className="text-center py-16">
              <HistoryIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mb-4">Ainda não fizeste nenhuma comparação.</p>
              <Button onClick={() => navigate('/compare')}>
                <GitCompare className="w-4 h-4 mr-2" />
                Ir para o Comparador
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 animate-slide-up">
            {items.map((item) => {
              const parties = item.party_ids
                .map((id) => partiesData.find((p) => p.id === id))
                .filter(Boolean);
              return (
                <Card key={item.id} className="group hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="flex items-center gap-3 text-base flex-wrap">
                        {parties.map((party, idx) => (
                          <span key={party!.id} className="flex items-center gap-2">
                            <PartyLogo src={party!.logo} alt={party!.abbreviation} size="sm" />
                            <span className="font-medium text-sm">{party!.abbreviation}</span>
                            {idx < parties.length - 1 && (
                              <span className="text-muted-foreground mx-1">vs</span>
                            )}
                          </span>
                        ))}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => remove(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.created_at).toLocaleString('pt-PT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => reopen(item)}>
                      <GitCompare className="w-3.5 h-3.5 mr-2" />
                      Reabrir
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default History;
