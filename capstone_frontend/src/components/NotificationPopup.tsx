import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink, CheckCheck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

interface NotificationPopupProps {
  notificationsPath: string; // Path to full notifications page
}

export function NotificationPopup({ notificationsPath }: NotificationPopupProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) return;

      const res = await fetch(`${API_URL}/me/notifications?per_page=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch notifications');

      const data = await res.json();
      const list = data.data || data || [];
      setNotifications(list.slice(0, 10)); // Show only 10 most recent
      const unread = list.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) return;

      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) return;

      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) return;

      await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setNotifications(prev => prev.filter(n => n.id !== id));
      if (!notifications.find(n => n.id === id)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: string) => {
    const iconClass = "text-2xl";
    switch (type) {
      case 'donation_confirmed':
      case 'donation_received':
      case 'donation_verified':
        return <span className={iconClass}>💰</span>;
      case 'new_follower':
        return <span className={iconClass}>👥</span>;
      case 'campaign_liked':
      case 'campaign_saved':
        return <span className={iconClass}>❤️</span>;
      case 'new_comment':
        return <span className={iconClass}>💬</span>;
      case 'new_campaign':
        return <span className={iconClass}>📢</span>;
      case 'campaign_update_posted':
      case 'campaign_completion':
        return <span className={iconClass}>📝</span>;
      case 'campaign_fund_usage':
      case 'new_fund_usage':
        return <span className={iconClass}>💵</span>;
      case 'refund_status':
      case 'refund_request':
        return <span className={iconClass}>↩️</span>;
      case 'charity_verification':
        return <span className={iconClass}>✅</span>;
      case 'new_user':
      case 'charity_registration':
        return <span className={iconClass}>👤</span>;
      case 'new_donation':
        return <span className={iconClass}>🎁</span>;
      case 'new_report':
        return <span className={iconClass}>⚠️</span>;
      default:
        return <Bell className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-accent transition-colors rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 px-1 text-[10px] font-bold rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[360px] sm:w-[420px] p-0 shadow-lg border-border" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-bold">Notifications</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-accent"
              onClick={() => {
                setOpen(false);
                navigate(notificationsPath);
              }}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Action Buttons */}
          {unreadCount > 0 && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 h-9 rounded-lg font-medium"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Notifications List */}
        <ScrollArea className="h-[400px] sm:h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
              <p className="text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-muted-foreground">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Bell className="h-12 w-12 opacity-50" />
              </div>
              <p className="font-semibold text-lg mb-1">No notifications</p>
              <p className="text-sm text-center">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-4 hover:bg-accent/50 transition-all cursor-pointer group ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                          !notification.read ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <p className="font-semibold text-sm leading-tight line-clamp-2">
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="h-3 w-3 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        
                        {/* Time and Actions */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-primary font-medium">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          
                          {/* Action Buttons - Show on hover */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 hover:bg-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-center hover:bg-accent rounded-lg h-11 font-medium text-primary"
                onClick={() => {
                  setOpen(false);
                  navigate(notificationsPath);
                }}
              >
                See all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
