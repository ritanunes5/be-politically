import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUnreadNotifications } from '@/hooks/useNotifications';

const NotificationsIcon = () => {
  const unread = useUnreadNotifications();

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative rounded-full hover:bg-secondary"
      aria-label={`Notificações${unread > 0 ? ` (${unread} por ler)` : ''}`}
    >
      <Link to="/notifications">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Link>
    </Button>
  );
};

export default NotificationsIcon;
