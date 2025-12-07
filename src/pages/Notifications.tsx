import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Building2, FileText, Check, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type: 'party' | 'topic' | 'general';
  link?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nova proposta do PS',
    description: 'O Partido Socialista apresentou uma nova proposta sobre habitação.',
    date: '6 Dez 2025',
    read: false,
    type: 'party',
  },
  {
    id: '2',
    title: 'Atualização sobre Saúde',
    description: 'Novos desenvolvimentos no debate sobre a reforma do SNS.',
    date: '5 Dez 2025',
    read: false,
    type: 'topic',
  },
  {
    id: '3',
    title: 'Debate parlamentar',
    description: 'Sessão plenária sobre orçamento de estado agendada.',
    date: '4 Dez 2025',
    read: true,
    type: 'general',
  },
  {
    id: '4',
    title: 'PSD apresenta programa eleitoral',
    description: 'O PSD divulgou as principais linhas do seu programa.',
    date: '3 Dez 2025',
    read: true,
    type: 'party',
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'party':
        return Building2;
      case 'topic':
        return FileText;
      default:
        return Bell;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold font-display mb-2 flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary" />
              Notificações
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">
              Acompanha as últimas atualizações dos teus temas e partidos favoritos.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3 animate-slide-up">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">Não tens notificações.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => {
              const Icon = getTypeIcon(notification.type);
              return (
                <Card
                  key={notification.id}
                  className={`group transition-all ${
                    !notification.read ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          notification.read
                            ? 'bg-secondary'
                            : 'bg-primary/10'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            notification.read ? 'text-muted-foreground' : 'text-primary'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-semibold ${
                              notification.read ? 'text-muted-foreground' : ''
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.description}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {notification.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsRead(notification.id)}
                            title="Marcar como lida"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNotification(notification.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
