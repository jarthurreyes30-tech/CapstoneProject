import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, CheckCheck, Trash2, Filter, RefreshCw, ExternalLink, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

interface ImprovedNotificationsPageProps {
  title: string;
  description: string;
}

export function ImprovedNotificationsPage({ title, description }: ImprovedNotificationsPageProps) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) return;

      const params = new URLSearchParams();
      if (filter === 'unread') params.append('unread', 'true');

      const res = await fetch(`${API_URL}/me/notifications?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to load notifications');

      const data = await res.json();
      let list = data.data || data || [];
      
      // Client-side filtering by category
      if (typeFilter !== 'all') {
        list = list.filter((item: NotificationItem) => {
          const type = item.type.toLowerCase();
          switch (typeFilter) {
            case 'donation':
              return type.includes('donation') || type.includes('refund');
            case 'campaign':
              return type.includes('campaign') && !type.includes('update') && !type.includes('comment');
            case 'update':
              return type.includes('update') || type.includes('completion');
            case 'follower':
              return type.includes('follow');
            case 'comment':
              return type.includes('comment');
            case 'refund':
              return type.includes('refund');
            default:
              return true;
          }
        });
      }
      
      setItems(list);
    } catch (error) {
      toast.error('Failed to load notifications');
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

      setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
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

      setItems(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
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

      setItems(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationLink = (notification: NotificationItem): string | null => {
    const data = notification.data || {};
    const userRole = user?.role;
    
    switch (notification.type) {
      case 'donation_confirmed':
      case 'donation_verified':
        // Donor sees their donation history, charity sees donation management
        if (userRole === 'donor') {
          return '/donor/history';
        } else if (userRole === 'charity_admin') {
          return '/charity/donations';
        }
        return null;
      
      case 'donation_received':
      case 'new_donation':
        // Charity receives notification about new donation
        if (userRole === 'charity_admin') {
          return '/charity/donations';
        } else if (userRole === 'admin') {
          return '/admin/fund-tracking';
        }
        return null;
      
      case 'new_campaign':
      case 'campaign_update_posted':
      case 'campaign_completion':
      case 'campaign_fund_usage':
      case 'campaign_liked':
      case 'campaign_saved':
      case 'new_comment':
        return data.campaign_id ? `/campaigns/${data.campaign_id}` : null;
      
      case 'new_follower':
      case 'charity_verification':
        return data.charity_id ? `/charity/${data.charity_id}` : null;
      
      case 'refund_status':
      case 'refund_request':
        // Route based on user role
        if (userRole === 'donor') {
          return '/donor/refunds';
        } else if (userRole === 'charity_admin') {
          return '/charity/refunds';
        }
        return null;
      
      case 'new_user':
      case 'charity_registration':
        return userRole === 'admin' ? '/admin/users' : null;
      
      case 'new_report':
        return userRole === 'admin' ? '/admin/reports' : null;
      
      case 'new_fund_usage':
        return userRole === 'admin' ? '/admin/fund-tracking' : null;
      
      default:
        return null;
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    // Mark as read if not already
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to the relevant page
    const link = getNotificationLink(notification);
    if (link) {
      navigate(link);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter, typeFilter]);

  const unreadCount = items.filter(i => !i.read).length;
  const filteredItems = items.filter(item => {
    if (filter === 'unread') return !item.read;
    if (filter === 'read') return item.read;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    const iconClass = "text-xl sm:text-2xl";
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
        return <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground mt-1 hidden sm:block">{description}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-8 px-3">
                  {unreadCount > 9 ? '9+' : unreadCount} unread
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllRead} 
                disabled={unreadCount === 0}
                className="h-9"
              >
                <CheckCheck className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Mark all read</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchNotifications}
                className="h-9"
              >
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-5xl mx-auto px-4 py-6">
        {/* Filters Card */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Filters</CardTitle>
              </div>
              <Settings2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="flex-1">
                <TabsList className="grid w-full grid-cols-3 h-10">
                  <TabsTrigger value="all" className="text-sm font-medium">All</TabsTrigger>
                  <TabsTrigger value="unread" className="text-sm font-medium">Unread</TabsTrigger>
                  <TabsTrigger value="read" className="text-sm font-medium">Read</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-10">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="donation">💰 Donations</SelectItem>
                  <SelectItem value="campaign">📢 Campaigns</SelectItem>
                  <SelectItem value="update">📝 Updates</SelectItem>
                  <SelectItem value="follower">👥 Followers</SelectItem>
                  <SelectItem value="comment">💬 Comments</SelectItem>
                  <SelectItem value="refund">↩️ Refunds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {filter === 'all' && `All Notifications`}
                {filter === 'unread' && `Unread Notifications`}
                {filter === 'read' && `Read Notifications`}
              </CardTitle>
              <Badge variant="secondary" className="text-sm">
                {filteredItems.length}
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-sm font-medium">Loading notifications...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-muted-foreground">
                <div className="bg-muted rounded-full p-6 mb-4">
                  <Bell className="h-16 w-16 opacity-50" />
                </div>
                <p className="text-xl font-semibold mb-2">No notifications</p>
                <p className="text-sm text-center max-w-sm">
                  {filter === 'unread' 
                    ? "You're all caught up! No unread notifications." 
                    : filter === 'read'
                    ? "No read notifications yet."
                    : "You're all caught up! Check back later for updates."}
                </p>
              </div>
            ) : (
              <div>
                {filteredItems.map((notification, index) => {
                  const hasLink = getNotificationLink(notification) !== null;
                  return (
                    <div key={notification.id}>
                      <div
                        className={`p-4 sm:p-5 transition-all group ${
                          !notification.read ? 'bg-primary/5' : 'bg-background'
                        } ${hasLink ? 'cursor-pointer hover:bg-accent/50' : ''}`}
                        onClick={() => hasLink && handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Icon */}
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${
                              !notification.read ? 'bg-primary/10' : 'bg-muted'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                                  )}
                                  {hasLink && (
                                    <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center flex-wrap gap-2">
                                  <span className="text-xs text-primary font-medium">
                                    {formatTimeAgo(notification.created_at)}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {notification.type.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    title="Mark as read"
                                    className="h-9 w-9 p-0 hover:bg-primary/10"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < filteredItems.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
