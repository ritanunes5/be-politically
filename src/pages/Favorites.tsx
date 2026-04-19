import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Building2, FileText, Lightbulb, ChevronRight, Trash2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { partiesData } from '@/data/parties';
import PartyLogo from '@/components/PartyLogo';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription, FREE_LIMITS } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';

interface FavoriteRow {
  id: string;
  item_id: string;
  item_type: string;
  created_at: string;
}

const topicLabels: Record<string, string> = {
  housing: 'Habitação',
  health: 'Saúde',
  economy: 'Economia',
  environment: 'Ambiente',
  education: 'Educação',
};

const proposalLabels: Record<string, string> = {
  'housing-ps': 'Habitação Pública - PS',
  'housing-psd': 'Incentivos Fiscais Habitação - PSD',
  'tax-ps': 'Reforma Fiscal - PS',
  'tax-il': 'Taxa Única IRS - IL',
};

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isPremium, favoritesCount, remainingFavorites, refresh } = useSubscription();
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Erro a carregar favoritos', description: error.message, variant: 'destructive' });
    } else {
      setFavorites(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const removeFavorite = async (id: string) => {
    const { error } = await supabase.from('favorites').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    refresh();
    toast({ title: 'Favorito removido' });
  };

  const partyFavorites = favorites.filter((f) => f.item_type === 'party');
  const topicFavorites = favorites.filter((f) => f.item_type === 'topic');
  const proposalFavorites = favorites.filter((f) => f.item_type === 'proposal');

  const renderEmptyState = (message: string) => (
    <div className="text-center py-8 text-muted-foreground">
      <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold font-display mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            Favoritos
          </h1>
          <p className="text-muted-foreground">
            Acompanha os partidos, temas e propostas que mais te interessam.
          </p>
        </div>

        {/* Quota banner */}
        {!isPremium && (
          <Card className="border-primary/30 bg-primary/5 animate-slide-up">
            <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <div className="text-sm">
                  <span className="font-medium">{favoritesCount} / {FREE_LIMITS.favorites}</span>{' '}
                  favoritos usados.{' '}
                  {remainingFavorites === 0
                    ? 'Atingiste o limite gratuito.'
                    : `Restam ${remainingFavorites} no plano gratuito.`}
                </div>
              </div>
              <Button size="sm" onClick={() => navigate('/pricing')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">A carregar...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Parties */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Partidos Guardados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partyFavorites.length === 0 ? (
                  renderEmptyState('Nenhum partido guardado')
                ) : (
                  <div className="space-y-3">
                    {partyFavorites.map((item) => {
                      const partyInfo = partiesData.find((p) => p.id === item.item_id);
                      if (!partyInfo) return null;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                        >
                          <Link
                            to={`/parties/${partyInfo.id}`}
                            className="flex items-center gap-3 flex-1 min-w-0"
                          >
                            <PartyLogo src={partyInfo.logo} alt={partyInfo.name} size="sm" />
                            <span className="font-medium text-sm truncate">{partyInfo.name}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform shrink-0" />
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFavorite(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Topics */}
            <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Temas Guardados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topicFavorites.length === 0 ? (
                  renderEmptyState('Nenhum tema guardado')
                ) : (
                  <div className="space-y-3">
                    {topicFavorites.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                      >
                        <Link
                          to={`/topics/${item.item_id}`}
                          className="flex items-center gap-3 flex-1 min-w-0"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm truncate">
                            {topicLabels[item.item_id] ?? item.item_id}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform shrink-0" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFavorite(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proposals */}
            <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Propostas Guardadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {proposalFavorites.length === 0 ? (
                  renderEmptyState('Nenhuma proposta guardada')
                ) : (
                  <div className="space-y-3">
                    {proposalFavorites.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Lightbulb className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm truncate">
                            {proposalLabels[item.item_id] ?? item.item_id}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFavorite(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
