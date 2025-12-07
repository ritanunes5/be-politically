import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Newspaper, 
  Building2, 
  FileText, 
  GitCompare, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const newsItems = [
  {
    id: 1,
    title: 'Parlamento aprova novo orçamento de estado',
    summary: 'O documento foi aprovado com votos favoráveis da maioria parlamentar...',
    date: '6 Dez 2025',
    tag: 'Economia',
  },
  {
    id: 2,
    title: 'Novas medidas ambientais propostas',
    summary: 'Conjunto de propostas visa reduzir emissões de carbono em 40% até 2030...',
    date: '5 Dez 2025',
    tag: 'Ambiente',
  },
  {
    id: 3,
    title: 'Debate sobre reforma da saúde',
    summary: 'Partidos apresentam visões distintas sobre o futuro do sistema nacional de saúde...',
    date: '5 Dez 2025',
    tag: 'Saúde',
  },
];

const quickActions = [
  { to: '/parties', icon: Building2, label: 'Ver Partidos', color: 'from-politic-600 to-politic-400' },
  { to: '/topics', icon: FileText, label: 'Explorar Temas', color: 'from-politic-700 to-politic-500' },
  { to: '/compare', icon: GitCompare, label: 'Comparar', color: 'from-politic-800 to-politic-600' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <section className="animate-fade-in">
          <div className="bg-gradient-to-r from-politic-900 via-politic-700 to-politic-600 rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
                Olá, {user?.name || 'Cidadão'}! 👋
              </h1>
              <p className="text-primary-foreground/80 text-lg">
                Bem-vindo ao Be+Politic. Mantém-te informado sobre política de forma imparcial.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to}>
                <Card className="group cursor-pointer border-0 overflow-hidden hover:scale-[1.02] transition-all duration-300">
                  <div className={`bg-gradient-to-br ${action.color} p-6`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                          <action.icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-lg text-primary-foreground">{action.label}</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary-foreground/70 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* News Section */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            Notícias do Dia
          </h2>
          <div className="grid gap-4">
            {newsItems.map((news) => (
              <Card key={news.id} className="group cursor-pointer hover:border-primary/50 transition-all">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {news.tag}
                        </span>
                        <span className="text-xs text-muted-foreground">{news.date}</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">{news.summary}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* AI Feature Preview */}
        <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-politic-100/50 to-background dark:from-politic-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Explicação com IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Em breve, poderás usar inteligência artificial para compreender temas complexos 
                sob a perspetiva de diferentes partidos políticos.
              </p>
              <Button variant="outline" disabled className="opacity-60">
                <Sparkles className="w-4 h-4 mr-2" />
                Disponível numa futura versão
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
