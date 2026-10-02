import Layout from '@/components/Layout';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, Scale, FileText, ExternalLink, ShieldCheck, Globe } from 'lucide-react';


import { getPartyById } from '@/data/parties';
import PartyLogo from '@/components/PartyLogo';
import { usePartyByKey } from '@/hooks/useParties';
import { useProposalsByParty, groupByCategory } from '@/hooks/useProposals';
import { useFavorites } from '@/hooks/useFavorites';
import FavoriteButton from '@/components/FavoriteButton';

const PartyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
  const isFavorite = id ? checkIsFavorite(id, 'party') : false;

  const staticParty = id ? getPartyById(id) : undefined;
  const { data: dbParty, isLoading: loadingParty } = usePartyByKey(id);
  const { data: proposals = [], isLoading: loadingProposals } = useProposalsByParty(dbParty?.id);

  if (!staticParty) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Partido não encontrado.</p>
              <Button asChild variant="outline">
                <Link to="/parties">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar aos partidos
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleFavorite = () => {
    if (!id) return;
    toggleFavorite(id, 'party');
  };

  const partyName = dbParty?.name ?? staticParty.name;
  const description = dbParty?.short_neutral_description ?? staticParty.description;
  const website = dbParty?.official_website;
  const lastVerified = dbParty?.last_verified_date;
  const grouped = groupByCategory(proposals);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Link
          to="/parties"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos partidos
        </Link>

        {/* Header Banner */}
        <div
          className="rounded-2xl p-8 text-primary-foreground relative overflow-hidden animate-fade-in"
          style={{ background: `linear-gradient(135deg, ${staticParty.color}cc, ${staticParty.color}88)` }}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <PartyLogo src={staticParty.logo} alt={`Logo ${partyName}`} size="lg" />
                <div>
                  <h1 className="text-3xl font-bold font-display">{partyName}</h1>
                  <p className="text-primary-foreground/80">{staticParty.ideology}</p>
                </div>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary-foreground/20 text-sm font-medium">
                {staticParty.abbreviation}
              </span>
            </div>
            <Button
              variant={isFavorite ? 'default' : 'glass'}
              size="lg"
              onClick={handleFavorite}
              className="shrink-0"
            >
              <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Nos Favoritos' : 'Adicionar aos Favoritos'}
            </Button>
          </div>
        </div>

        {/* About */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Sobre o partido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">{description}</p>
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  Site oficial
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {lastVerified && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Última verificação: {new Date(lastVerified).toLocaleDateString('pt-PT')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Propostas verificadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                {loadingProposals
                  ? 'A carregar propostas...'
                  : proposals.length === 0
                    ? 'Ainda não existem propostas validadas para este partido.'
                    : `${proposals.length} propostas validadas, agrupadas por categoria.`}
              </p>
              {dbParty?.electoral_program_url && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Fonte oficial · {dbParty.electoral_program_year ? `Programa Eleitoral ${dbParty.electoral_program_year}` : dbParty.electoral_program_name}
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <a href={dbParty.electoral_program_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver programa eleitoral
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Proposals grouped by category */}
        {!loadingProposals && grouped.length > 0 && (
          <div className="space-y-6">
            {grouped.map(([category, items]) => (
              <Card key={category} className="animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-xl">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl bg-secondary/50 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold">{p.title}</h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <FavoriteButton itemId={p.id} itemType="proposal" />
                          <ShieldCheck className="w-4 h-4 text-primary mt-1" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{p.neutral_summary}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2 border-t border-border/50">
                        {p.official_source_url && (
                          <a
                            href={p.official_source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Fonte oficial
                          </a>
                        )}
                        {p.source_name && <span>{p.source_name}</span>}
                        {p.source_document_name && <span>Doc.: {p.source_document_name}</span>}
                        {p.source_page && <span>Página {p.source_page}</span>}
                        {(p.last_verified_at || p.last_verified_date) && (
                          <span>
                            Última verificação: {new Date((p.last_verified_at || p.last_verified_date)!).toLocaleDateString('pt-PT')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loadingProposals && proposals.length === 0 && !loadingParty && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Ainda não existem propostas validadas com fonte oficial para este partido.
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default PartyDetail;
