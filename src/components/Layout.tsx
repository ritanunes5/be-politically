import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import {
  Building2,
  FileText,
  GitCompare,
  Search,
  Heart,
  History,
  Bell,
  User,
  Bot,
  Menu,
  X,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

const navItems = [
  { to: '/parties', icon: Building2, label: 'Partidos' },
  { to: '/topics', icon: FileText, label: 'Temas' },
  { to: '/compare', icon: GitCompare, label: 'Comparar' },
  { to: '/ask', icon: Bot, label: 'Pergunta IA' },
  { to: '/search', icon: Search, label: 'Pesquisa' },
  { to: '/favorites', icon: Heart, label: 'Favoritos' },
  { to: '/history', icon: History, label: 'Histórico' },
  { to: '/notifications', icon: Bell, label: 'Notificações' },
  { to: '/profile', icon: User, label: 'Perfil' },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  const { isPremium, loading } = useSubscription();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/home" className="flex items-center gap-2">
              <img src={logo} alt="Be+Politic" className="w-10 h-10 rounded-full" />
              <span className="font-display font-bold text-lg hidden sm:block">
                <span className="text-politic-700 dark:text-politic-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Be</span>
                <span className="text-politic-500 dark:text-politic-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">+</span>
                <span className="text-politic-800 dark:text-politic-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Politic</span>
              </span>
            </Link>

            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {user && !loading && (
                isPremium ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold border border-primary/30">
                    <Crown className="w-3.5 h-3.5" />
                    Premium
                  </span>
                ) : (
                  <Link
                    to="/pricing"
                    className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Upgrade
                  </Link>
                )
              )}
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="xl:hidden border-t border-border bg-card animate-slide-down">
            <div className="container mx-auto px-4 py-4 grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {user && !isPremium && (
                <Link
                  to="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold bg-primary text-primary-foreground"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade para Premium
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border py-6 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Be+Politic. Informação política imparcial para todos.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
