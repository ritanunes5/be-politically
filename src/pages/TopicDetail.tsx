import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ChevronRight, ShieldCheck } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getTopicById } from '@/data/topics';
import { partiesData, getPartyById } from '@/data/parties';
import PartyLogo from '@/components/PartyLogo';
import { useParties } from '@/hooks/useParties';
import { useProposalsByCategories } from '@/hooks/useProposals';

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
                <h1 className="text-3xl font-bold font-display mb-2">{topic.name}</h1>
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
