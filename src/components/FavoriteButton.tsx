import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFavorites, type FavoriteType } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  itemId: string;
  itemType: FavoriteType;
  size?: 'sm' | 'icon';
  variant?: 'ghost' | 'outline';
  className?: string;
  showLabel?: boolean;
  stopPropagation?: boolean;
}

const FavoriteButton = ({
  itemId,
  itemType,
  size = 'icon',
  variant = 'ghost',
  className,
  showLabel = false,
  stopPropagation = true,
}: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(itemId, itemType);

  const onClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user) {
      toast.error('Inicia sessão para guardar favoritos.');
      return;
    }
    toggleFavorite(itemId, itemType);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size === 'icon' && !showLabel ? 'icon' : 'sm'}
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className={cn(active && 'text-primary', className)}
    >
      <Heart className={cn('w-4 h-4', active && 'fill-current', showLabel && 'mr-2')} />
      {showLabel && (active ? 'Nos favoritos' : 'Adicionar aos favoritos')}
    </Button>
  );
};

export default FavoriteButton;
