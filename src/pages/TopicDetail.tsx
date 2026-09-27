import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ChevronRight, ShieldCheck } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getTopicById } from '@/data/topics';
import { partiesData } from '@/data/parties';
import PartyLogo from '@/components/PartyLogo';
import { useParties } from '@/hooks/useParties';
import { useProposalsByCategories } from '@/hooks/useProposals';
import FavoriteButton from '@/components/FavoriteButton';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const TopicDetail = () => {
  const { id } = useParams<{ id: string }>();
  const topic = id ? getTopicById(id) : undefined;

  if (!topic) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold font-display">Tema não encontrado</h1>
          <p className="text-muted-foreground">
            O tema que procuras não existe ou foi removido.
          </p>
          <Button asChild>
            <Link to="/topics">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar a Explorar Temas
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const Icon = topic.icon;

  const { data: dbParties = [], isLoading: loadingParties, isError: partiesError } = useParties();
  const {
    data: proposals = [],
    isLoading: loadingProposals,
    isError: proposalsError,
  } = useProposalsByCategories(topic.categories);

  // Group validated proposals by party DB id
  const proposalsByPartyId = new Map<string, typeof proposals>();
  for (const p of proposals) {
    if (!proposalsByPartyId.has(p.party_id)) proposalsByPartyId.set(p.party_id, []);
    proposalsByPartyId.get(p.party_id)!.push(p);
  }


  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
        {/* Back link */}
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to="/topics">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Explorar Temas
          </Link>
        </Button>

        {/* Header */}
        <Card className="overflow-hidden animate-fade-in">
          <div className={`h-2 bg-gradient-to-r ${topic.color}`} />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-3xl font-bold font-display mb-2">{topic.name}</h1>
                  {id && (
                    <FavoriteButton itemId={id} itemType="topic" showLabel size="sm" variant="outline" />
                  )}
                </div>
                <p className="text-muted-foreground">{topic.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Long description */}
        <Card className="animate-slide-up">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-xl font-semibold">Enquadramento</h2>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {topic.longDescription}
            </p>
          </CardContent>
        </Card>

        {/* Key facts */}
        {topic.keyFacts.length > 0 && (
          <Card className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Dados-chave</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {topic.keyFacts.map((fact, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border p-4 space-y-2 bg-card"
                  >
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {fact.label}
                    </p>
                    <p className="text-lg font-semibold">{fact.value}</p>
                    <a
                      href={fact.source.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-primary hover:underline"
                    >
                      {fact.source.source_name}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                    <p className="text-[10px] text-muted-foreground">
                      Verificado a {formatDate(fact.source.last_verified_date)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sources */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-semibold">Fontes oficiais</h2>
              <Badge variant="secondary" className="text-xs">
                Última verificação:{' '}
                {formatDate(
                  topic.sources
                    .map((s) => s.last_verified_date)
                    .sort()
                    .reverse()[0],
                )}
              </Badge>
            </div>
            <ul className="space-y-2">
              {topic.sources.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:border-primary/50 hover:bg-accent/40 transition-colors"
                  >
                    <span className="text-sm font-medium">{s.source_name}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              A informação apresentada é factual e sustentada nas fontes acima. Não
              representa a posição de nenhum partido político.
            </p>
          </CardContent>
        </Card>

        {/* Parties & verified proposals for this topic */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.12s' }}>
          <CardHeader>
            <CardTitle className="text-xl">Propostas dos partidos neste tema</CardTitle>
            <p className="text-sm text-muted-foreground">
              Apresentamos todos os partidos. Para cada um, mostramos apenas
              propostas oficiais verificadas, com fonte e data de verificação.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {partiesError || proposalsError ? (
              <p className="text-sm text-destructive">
                Não foi possível carregar a informação. Tenta novamente mais tarde.
              </p>
            ) : loadingParties || loadingProposals ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              partiesData.map((staticParty) => {
                const dbParty = dbParties.find(
                  (dp) => dp.existing_party_key === staticParty.id,
                );
                const partyProposals = dbParty
                  ? proposalsByPartyId.get(dbParty.id) ?? []
                  : [];

                return (
                  <div
                    key={staticParty.id}
                    className="rounded-xl border border-border p-4 space-y-3 bg-card"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <Link
                        to={`/party/${staticParty.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <PartyLogo
                          src={staticParty.logo}
                          alt={`Logo ${staticParty.name}`}
                          size="sm"
                        />
                        <div>
                          <p className="font-semibold group-hover:text-primary transition-colors">
                            {staticParty.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {staticParty.abbreviation} · {staticParty.ideology}
                          </p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2">
                        {dbParty?.electoral_program_url && (
                          <a
                            href={dbParty.electoral_program_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Ver programa eleitoral
                          </a>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {partyProposals.length}{' '}
                          {partyProposals.length === 1 ? 'proposta' : 'propostas'}
                        </Badge>
                      </div>
                    </div>

                    {partyProposals.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        Nenhuma proposta oficial verificada para este tema.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {partyProposals.map((p) => (
                          <li
                            key={p.id}
                            className="rounded-lg bg-secondary/50 p-3 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm">{p.title}</h4>
                              <div className="flex items-center gap-1 shrink-0">
                                <FavoriteButton itemId={p.id} itemType="proposal" />
                                <ShieldCheck className="w-4 h-4 text-primary mt-0.5" />
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {p.neutral_summary}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2 border-t border-border/50">
                              <span className="font-medium">{p.category}</span>
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
                              {p.source_document_name && (
                                <span>Doc.: {p.source_document_name}</span>
                              )}
                              {p.last_verified_date && (
                                <span>
                                  Verificado a {formatDate(p.last_verified_date)}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
            <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
              A ausência de propostas significa apenas que ainda não existem propostas
              oficiais verificadas para este partido neste tema. Não representa uma
              tomada de posição editorial.
            </p>
          </CardContent>
        </Card>


        {/* Compare CTA */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <CardContent className="p-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold">Ver posições dos partidos</h3>
              <p className="text-sm text-muted-foreground">
                Compara o que os {topic.parties} partidos propõem neste tema.
              </p>
            </div>
            <Button asChild>
              <Link to="/compare">
                Comparar partidos
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TopicDetail;
