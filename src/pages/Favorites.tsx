import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Building2, FileText, Lightbulb, ChevronRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface FavoriteItem {
  id: string;
  name: string;
  type: 'party' | 'topic' | 'proposal';
  color?: string;
}

const mockFavorites: FavoriteItem[] = [
  { id: 'ps', name: 'Partido Socialista', type: 'party', color: '#FF66B2' },
  { id: 'psd', name: 'Partido Social Democrata', type: 'party', color: '#FF6600' },
  { id: 'housing', name: 'Habitação', type: 'topic' },
  { id: 'health', name: 'Saúde', type: 'topic' },
  { id: 'housing-ps', name: 'Habitação Pública - PS', type: 'proposal' },
];

const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(mockFavorites);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const partyFavorites = favorites.filter((f) => f.type === 'party');
  const topicFavorites = favorites.filter((f) => f.type === 'topic');
  const proposalFavorites = favorites.filter((f) => f.type === 'proposal');

  const renderEmptyState = (message: string) => (
    <div className="text-center py-8 text-muted-foreground">
      <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold font-display mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            Favoritos
          </h1>
          <p className="text-muted-foreground">
            Acompanha os partidos, temas e propostas que mais te interessam.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Party Favorites */}
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
                  {partyFavorites.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                    >
                      <Link to={`/parties/${item.id}`} className="flex items-center gap-3 flex-1">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground"
                          style={{ backgroundColor: item.color }}
                        >
                          {item.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-medium text-sm">{item.name}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
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

          {/* Topic Favorites */}
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
                      <Link to={`/topics/${item.id}`} className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{item.name}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
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

          {/* Proposal Favorites */}
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
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Lightbulb className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{item.name}</span>
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
      </div>
    </Layout>
  );
};

export default Favorites;
