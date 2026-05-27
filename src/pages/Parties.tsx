import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronRight, Heart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { partiesData } from '@/data/parties';
import PartyLogo from '@/components/PartyLogo';
import { useFavorites } from '@/hooks/useFavorites';

const Parties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { isFavorite, toggleFavorite } = useFavorites();

  const filteredParties = partiesData.filter((party) =>
    party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFavoriteClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id, 'party');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold font-display mb-2">Partidos Políticos</h1>
          <p className="text-muted-foreground">
            Explora os partidos políticos portugueses e as suas posições.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md animate-slide-up">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Pesquisar partidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {filteredParties.map((party) => (
            <Link key={party.id} to={`/parties/${party.id}`}>
              <Card className="group cursor-pointer h-full hover:border-primary/50 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Party Logo */}
                    <PartyLogo 
                      src={party.logo} 
                      alt={`Logo ${party.name}`}
                      size="md"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                          {party.name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 -mr-2"
                          onClick={(e) => handleFavoriteClick(party.id, e)}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFavorite(party.id, 'party')
                                ? 'fill-primary text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mb-2">
                        {party.ideology}
                      </span>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {party.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end mt-4 text-sm text-primary font-medium">
                    Ver detalhes
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredParties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum partido encontrado.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Parties;
