import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import logo from '@/assets/logo.png';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="animate-fade-in flex flex-col items-center space-y-8 max-w-md w-full">
          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 blur-3xl opacity-30 bg-primary rounded-full scale-110" />
            <img 
              src={logo} 
              alt="Be+Politic Logo" 
              className="w-48 h-48 md:w-64 md:h-64 relative z-10 drop-shadow-2xl animate-pulse-glow rounded-full"
            />
          </div>

          {/* Title */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold font-display">
              <span className="text-politic-600 dark:text-politic-400">Be</span>
              <span className="text-politic-500 dark:text-politic-300">+</span>
              <span className="text-politic-700 dark:text-politic-400">Politic</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Informação política imparcial para jovens cidadãos
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
            <Button asChild variant="hero" size="lg" className="flex-1">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link to="/register">Criar Conta</Link>
            </Button>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-3 gap-4 pt-8 w-full max-w-sm">
            <FeatureIcon icon="🏛️" label="Partidos" />
            <FeatureIcon icon="📋" label="Temas" />
            <FeatureIcon icon="⚖️" label="Comparar" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-muted-foreground text-sm">
        <p>© 2024 Be+Politic. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

const FeatureIcon = ({ icon, label }: { icon: string; label: string }) => (
  <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
    <span className="text-2xl">{icon}</span>
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
  </div>
);

export default Landing;
