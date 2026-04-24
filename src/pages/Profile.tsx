import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  User,
  Mail,
  Heart,
  Bell,
  Moon,
  Sun,
  LogOut,
  Settings,
  Shield,
  Crown,
  Sparkles,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import AvatarUpload from '@/components/AvatarUpload';

const Profile = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isPremium, tier, status, periodEnd, refresh } = useSubscription();
  const [name, setName] = useState(user?.user_metadata?.display_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [portalLoading, setPortalLoading] = useState(false);

  // Handle return from checkout
  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (!checkout) return;
    if (checkout === 'success') {
      toast.success('Subscrição ativada! A confirmar...');
      // Trigger sync with Stripe
      supabase.functions.invoke('check-subscription').finally(() => {
        refresh();
      });
    } else if (checkout === 'cancelled') {
      toast.info('Checkout cancelado.');
    }
    searchParams.delete('checkout');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, refresh]);

  const handleLogout = async () => {
    await logout();
    toast.success('Sessão terminada');
    navigate('/');
  };

  const handleSave = () => {
    toast.success('Alterações guardadas');
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Sem URL do portal');
      }
    } catch (err) {
      console.error(err);
      toast.error('Não foi possível abrir o portal de gestão.');
    } finally {
      setPortalLoading(false);
    }
  };

  const formattedPeriodEnd = periodEnd
    ? new Date(periodEnd).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold font-display mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            Perfil
          </h1>
          <p className="text-muted-foreground">
            Gere as tuas informações pessoais e preferências.
          </p>
        </div>

        {/* Subscription card (full width) */}
        <Card
          className={`animate-slide-up ${
            isPremium ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-transparent' : ''
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
              <span className="flex items-center gap-2">
                <Crown className={`w-5 h-5 ${isPremium ? 'text-primary' : 'text-muted-foreground'}`} />
                Subscrição
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  isPremium
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {isPremium ? 'PREMIUM' : 'GRATUITO'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPremium ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Estado</p>
                    <p className="font-medium capitalize">
                      {status === 'active' && 'Ativa'}
                      {status === 'trialing' && 'Em período experimental'}
                      {status === 'past_due' && 'Pagamento em atraso'}
                      {status === 'canceled' && 'Cancelada'}
                      {!status && '—'}
                    </p>
                  </div>
                  {formattedPeriodEnd && (
                    <div>
                      <p className="text-muted-foreground">
                        {status === 'canceled' ? 'Termina em' : 'Próxima renovação'}
                      </p>
                      <p className="font-medium">{formattedPeriodEnd}</p>
                    </div>
                  )}
                </div>
                <Button onClick={openPortal} disabled={portalLoading} className="w-full sm:w-auto">
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Gerir subscrição
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Estás no plano gratuito. Faz upgrade para desbloquear comparações e perguntas IA ilimitadas, favoritos sem limite e muito mais.
                </p>
                <Button onClick={() => navigate('/pricing')} className="w-full sm:w-auto">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ver planos Premium
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AvatarUpload />
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nome</label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="O teu nome" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="O teu email" />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">Guardar Alterações</Button>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Preferências
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                  <div>
                    <p className="font-medium">Modo de exibição</p>
                    <p className="text-sm text-muted-foreground">{theme === 'dark' ? 'Modo escuro ativo' : 'Modo claro ativo'}</p>
                  </div>
                </div>
                <div className="flex gap-1 bg-background rounded-lg p-1">
                  <Button variant={theme === 'light' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('light')} className="gap-1">
                    <Sun className="w-4 h-4" /> Claro
                  </Button>
                  <Button variant={theme === 'dark' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('dark')} className="gap-1">
                    <Moon className="w-4 h-4" /> Escuro
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Notificações</p>
                    <p className="text-sm text-muted-foreground">Receber alertas sobre favoritos</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Gerir</Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Favoritos</p>
                    <p className="text-sm text-muted-foreground">Gerir partidos e temas guardados</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/favorites')}>Ver</Button>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">Alterar Password</Button>
              <Button variant="outline" className="w-full text-destructive hover:text-destructive">Eliminar Conta</Button>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-primary" />
                Sessão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Terminar Sessão
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
