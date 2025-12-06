import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Building2, FileText, Lightbulb, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'party' | 'topic' | 'proposal';
  link: string;
}

const allResults: SearchResult[] = [
  { id: 'ps', title: 'Partido Socialista', description: 'Partido de centro-esquerda', type: 'party', link: '/parties/ps' },
  { id: 'psd', title: 'Partido Social Democrata', description: 'Partido de centro-direita', type: 'party', link: '/parties/psd' },
  { id: 'housing', title: 'Habitação', description: 'Políticas de habitação', type: 'topic', link: '/topics/housing' },
  { id: 'health', title: 'Saúde', description: 'Sistema Nacional de Saúde', type: 'topic', link: '/topics/health' },
  { id: 'environment', title: 'Ambiente', description: 'Sustentabilidade e clima', type: 'topic', link: '/topics/environment' },
  { id: 'housing-ps', title: 'Habitação Pública - PS', description: 'Proposta do PS para habitação', type: 'proposal', link: '/parties/ps' },
];

const SearchPage = () => {
  const [query, setQuery] = useState('');

  const results = query.length > 0
    ? allResults.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'party': return Building2;
      case 'topic': return FileText;
      case 'proposal': return Lightbulb;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'party': return 'Partido';
      case 'topic': return 'Tema';
      case 'proposal': return 'Proposta';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold font-display mb-2 flex items-center gap-3">
            <SearchIcon className="w-8 h-8 text-primary" />
            Pesquisa
          </h1>
          <p className="text-muted-foreground">
            Encontra partidos, temas e propostas rapidamente.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-2xl animate-slide-up">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <Input
            placeholder="Pesquisar partidos, temas, propostas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-14 text-lg"
            autoFocus
          />
        </div>

        {/* Results */}
        {query.length > 0 && (
          <div className="space-y-4 animate-slide-up">
            <p className="text-sm text-muted-foreground">
              {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
            </p>

            {results.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <SearchIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {results.map((result) => {
                  const Icon = getIcon(result.type);
                  return (
                    <Link key={result.id} to={result.link}>
                      <Card className="group cursor-pointer hover:border-primary/50 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold group-hover:text-primary transition-colors">
                                  {result.title}
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground">
                                  {getTypeLabel(result.type)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{result.description}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {query.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-lg text-muted-foreground">
              Começa a escrever para pesquisar
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['Habitação', 'PS', 'Saúde', 'PSD', 'Ambiente'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
