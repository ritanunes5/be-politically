import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Loader2, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

type Plan = 'monthly' | 'yearly';

const features = {
  free: [
    '3 comparações por dia',
    'Até 5 favoritos',
    '1 pergunta IA por dia',
    'Acesso a partidos e temas',
  ],
  premium: [
    'Comparações ilimitadas',
    'Favoritos sem limite',
    'Perguntas IA ilimitadas',
    'Histórico completo',
    'Acesso prioritário a novidades',
    'Suporte premium',
  ],
};

const Pricing = () => {
  const { isAuthenticated } = useAuth();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<Plan | null>(null);

  const startCheckout = async (plan: Plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Sem URL de checkout');
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o checkout. Tenta novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Planos Be+Politic
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Escolhe o teu plano
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Começa grátis ou desbloqueia o Be+Politic completo com Premium.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 animate-slide-up">
          {/* Free */}
          <Card className={isPremium ? 'opacity-60' : ''}>
            <CardHeader>
              <CardTitle className="font-display">Gratuito</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">0€</span>
                <span className="text-muted-foreground">/sempre</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Para experimentar a plataforma.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {features.free.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" disabled>
                {isPremium ? 'Plano anterior' : 'Plano atual'}
              </Button>
            </CardContent>
          </Card>

          {/* Monthly */}
          <Card className="border-primary/40 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              Mais flexível
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Crown className="w-5 h-5 text-primary" />
                Premium Mensal
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">4,99€</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Cancela quando quiseres.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {features.premium.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                onClick={() => startCheckout('monthly')}
                disabled={loading !== null || isPremium}
              >
                {loading === 'monthly' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isPremium ? 'Já és Premium' : 'Subscrever mensalmente'}
              </Button>
            </CardContent>
          </Card>

          {/* Yearly */}
          <Card className="border-primary relative bg-primary/5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              Poupa 17%
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Crown className="w-5 h-5 text-primary" />
                Premium Anual
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">49,99€</span>
                <span className="text-muted-foreground">/ano</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Equivale a 4,17€/mês — 2 meses grátis.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {features.premium.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                onClick={() => startCheckout('yearly')}
                disabled={loading !== null || isPremium}
              >
                {loading === 'yearly' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isPremium ? 'Já és Premium' : 'Subscrever anualmente'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Pagamento seguro processado por Stripe. Podes cancelar a qualquer momento no teu perfil.
        </p>
      </div>
    </Layout>
  );
};

export default Pricing;
