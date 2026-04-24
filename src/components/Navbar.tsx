import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import {
  Building2,
  FileText,
  GitCompare,
  Bot,
  Menu,
  X,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import SearchBar from '@/components/SearchBar';
import NotificationsIcon from '@/components/NotificationsIcon';
import AvatarDropdown from '@/components/AvatarDropdown';

const navItems = [
  { to: '/parties', icon: Building2, label: 'Partidos' },
  { to: '/topics', icon: FileText, label: 'Temas' },
  { to: '/compare', icon: GitCompare, label: 'Comparar' },
  { to: '/ask', icon: Bot, label: 'Pergunta IA' },
];

const Navbar = () => {
  const { user } = useAuth();
  const { isPremium, loading } = useSubscription();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Be+Politic" className="w-9 h-9 rounded-full" />
            <span className="font-display font-bold text-lg hidden sm:block">
              <span className="text-politic-700 dark:text-politic-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Be</span>
              <span className="text-politic-500 dark:text-politic-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">+</span>
              <span className="text-politic-800 dark:text-politic-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Politic</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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

          {/* Global search bar */}
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <SearchBar />
          </div>

          {/* Right side: premium badge, notifications, avatar */}
          <div className="flex items-center gap-1.5 ml-auto md:ml-0 shrink-0">
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
            {user && <NotificationsIcon />}
            <AvatarDropdown />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Mobile nav menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-border bg-card animate-slide-down">
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
  );
};

export default Navbar;
