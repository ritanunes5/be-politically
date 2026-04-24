import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/hooks/useProfile';
import { Heart, History, LogOut, Moon, Settings, Sun, User as UserIcon, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const AvatarDropdown = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { profile } = useProfile();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Button asChild size="sm" variant="default">
        <Link to="/login">
          <LogIn className="w-4 h-4 mr-2" />
          Entrar
        </Link>
      </Button>
    );
  }

  const displayName =
    profile?.display_name ||
    (user?.user_metadata as { display_name?: string } | undefined)?.display_name ||
    user?.email?.split('@')[0] ||
    'Utilizador';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    toast.success('Sessão terminada');
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 hover:bg-secondary"
          aria-label="Menu de utilizador"
        >
          <Avatar className="h-9 w-9 border-2 border-border">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold truncate">{displayName}</span>
            {user?.email && (
              <span className="text-xs text-muted-foreground font-normal truncate">
                {user.email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 mr-2" />
              Modo claro
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              Modo escuro
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/favorites')} className="cursor-pointer">
          <Heart className="w-4 h-4 mr-2" />
          Favoritos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/history')} className="cursor-pointer">
          <History className="w-4 h-4 mr-2" />
          Histórico
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Definições de perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Terminar sessão
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AvatarDropdown;
