import Layout from '@/components/Layout';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, History, Scale, FileText, Activity, Bell } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { partiesDetails } from '@/data/parties';

const PartyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isFavorite, setIsFavorite] = useState(false);

  const party = id ? partiesDetails[id] : null;

  if (!party) {
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
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
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
          style={{ background: `linear-gradient(135deg, ${party.color}cc, ${party.color}88)` }}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center overflow-hidden p-2">
                  <img 
                    src={party.logo} 
                    alt={`Logo ${party.name}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-display">{party.name}</h1>
                  <p className="text-primary-foreground/80">Fundado em {party.founded}</p>
                </div>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary-foreground/20 text-sm font-medium">
                {party.ideology}
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

        {/* Content Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* History */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                História
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{party.history}</p>
            </CardContent>
          </Card>

          {/* Values */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Valores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {party.values.map((value, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Proposals */}
          <Card className="md:col-span-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Propostas Principais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {party.proposals.map((proposal, index) => (
                  <div key={index} className="p-4 rounded-xl bg-secondary/50">
                    <h4 className="font-semibold mb-2">{proposal.title}</h4>
                    <p className="text-sm text-muted-foreground">{proposal.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="md:col-span-2 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {party.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30">
                    <Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PartyDetail;
