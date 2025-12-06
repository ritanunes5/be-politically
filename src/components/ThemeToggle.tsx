import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-10 h-10 bg-secondary hover:bg-secondary/80 transition-all duration-300"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-politic-600" />
      ) : (
        <Sun className="h-5 w-5 text-politic-300" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
