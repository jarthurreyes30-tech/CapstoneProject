import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Filter, Calendar, LogIn, LogOut, Heart, TrendingUp, UserPlus, FileText, Settings, Eye, Activity as ActivityIcon, Edit, Trash2, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserActivityLog {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  action_type: string;
  description: string;
  target_type?: string;
  target_id?: number;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export default function AdminActionLogs() {
  const [logs, setLogs] = useState<UserActivityLog[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchLogs();
    fetchStatistics();
  }, [actionTypeFilter, targetTypeFilter, startDate, endDate, searchTerm]);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/admin/activity-logs/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      // Don't show error toast for statistics, it's not critical
    }
  };

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (actionTypeFilter !== "all") params.append("action_type", actionTypeFilter);
      if (targetTypeFilter !== "all") params.append("target_type", targetTypeFilter);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (searchTerm) params.append("search", searchTerm);

      const response = await axios.get(`/admin/activity-logs?${params.toString()}`);
      setLogs(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch action logs:", error);
      toast.error("Failed to fetch action logs");
      setLogs([]); // Ensure logs is always an array
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (actionTypeFilter !== "all") params.append("action_type", actionTypeFilter);
      if (targetTypeFilter !== "all") params.append("target_type", targetTypeFilter);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const response = await axios.get(`/admin/activity-logs/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Logs exported successfully");
    } catch (error) {
      toast.error("Failed to export logs");
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionBadge = (actionType: string) => {
    // Dynamic color assignment based on action type
    const getColorForAction = (action: string) => {
      // Authentication actions
      if (action.includes('login')) return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      if (action.includes('logout')) return "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300";
      if (action.includes('register')) return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      
      // Donation actions
      if (action.includes('donation')) return "bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300";
      
      // Campaign actions
      if (action.includes('campaign')) return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
      
      // Profile actions
      if (action.includes('profile') || action.includes('password')) return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
      
      // Charity actions
      if (action.includes('charity_approved')) return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      if (action.includes('charity_rejected')) return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      if (action.includes('charity')) return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300";
      
      // Account actions
      if (action.includes('deactivated')) return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      if (action.includes('deleted')) return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      
      // Post/Comment actions
      if (action.includes('post') || action.includes('comment')) return "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300";
      
      // Follow actions
      if (action.includes('follow')) return "bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300";
      
      // Fund usage actions
      if (action.includes('fund')) return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300";
      
      // Refund actions
      if (action.includes('refund')) return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300";
      
      // Default
      return "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300";
    };

    const color = getColorForAction(actionType);
    
    return (
      <Badge className={color}>
        {formatActionType(actionType)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getActivityIcon = (actionType: string) => {
    // Dynamic icon assignment based on action type
    if (actionType.includes('login')) return LogIn;
    if (actionType.includes('logout')) return LogOut;
    if (actionType.includes('donation')) return Heart;
    if (actionType.includes('campaign')) return TrendingUp;
    if (actionType.includes('register')) return UserPlus;
    if (actionType.includes('profile') || actionType.includes('password') || actionType.includes('email_changed')) return Settings;
    if (actionType.includes('approved') || actionType.includes('activated')) return CheckCircle;
    if (actionType.includes('rejected') || actionType.includes('deleted')) return Trash2;
    if (actionType.includes('suspended') || actionType.includes('deactivated')) return Ban;
    if (actionType.includes('updated') || actionType.includes('edited')) return Edit;
    if (actionType.includes('charity')) return FileText;
    if (actionType.includes('post') || actionType.includes('comment') || actionType.includes('update')) return FileText;
    if (actionType.includes('follow')) return Heart;
    if (actionType.includes('fund') || actionType.includes('refund')) return TrendingUp;
    if (actionType.includes('document')) return FileText;
    if (actionType.includes('account')) return UserPlus;
    return ActivityIcon;
  };

  const getActivityColor = (actionType: string) => {
    // Dynamic color assignment based on action type
    if (actionType.includes('login')) return "bg-blue-100 dark:bg-blue-900/50 text-blue-600";
    if (actionType.includes('logout')) return "bg-gray-100 dark:bg-gray-800/50 text-gray-600";
    if (actionType.includes('donation')) return "bg-green-100 dark:bg-green-900/50 text-green-600";
    if (actionType.includes('campaign')) return "bg-purple-100 dark:bg-purple-900/50 text-purple-600";
    if (actionType.includes('register')) return "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600";
    if (actionType.includes('profile') || actionType.includes('password')) return "bg-orange-100 dark:bg-orange-900/50 text-orange-600";
    if (actionType.includes('charity_approved')) return "bg-green-100 dark:bg-green-900/50 text-green-600";
    if (actionType.includes('charity_rejected')) return "bg-red-100 dark:bg-red-900/50 text-red-600";
    if (actionType.includes('charity')) return "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600";
    if (actionType.includes('deactivated')) return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600";
    if (actionType.includes('deleted')) return "bg-red-100 dark:bg-red-900/50 text-red-600";
    if (actionType.includes('post') || actionType.includes('comment')) return "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600";
    if (actionType.includes('follow')) return "bg-teal-100 dark:bg-teal-900/50 text-teal-600";
    if (actionType.includes('fund')) return "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600";
    if (actionType.includes('refund')) return "bg-amber-100 dark:bg-amber-900/50 text-amber-600";
    return "bg-gray-100 dark:bg-gray-800/50 text-gray-600";
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Action Logs
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Monitor all user activities and administrative actions
          </p>
        </div>
        <Button onClick={exportLogs} className="flex items-center gap-2 hover:scale-105 transition-transform">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </motion.div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ActivityIcon className="h-4 w-4" />
                  Total Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{statistics.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All user actions</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Donations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{statistics.donations || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Total donation actions</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Campaigns Created
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{statistics.campaigns || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">New campaigns</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-l-4 border-l-cyan-500 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/30 dark:to-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  New Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-600">{statistics.registrations || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">User signups</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                <SelectItem value="all">All Actions</SelectItem>
                {/* Authentication Actions */}
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="register">Register</SelectItem>
                <SelectItem value="user_registered">User Registered</SelectItem>
                <SelectItem value="email_verified">Email Verified</SelectItem>
                {/* Account Actions */}
                <SelectItem value="profile_updated">Profile Updated</SelectItem>
                <SelectItem value="password_changed">Password Changed</SelectItem>
                <SelectItem value="account_deactivated">Account Deactivated</SelectItem>
                <SelectItem value="account_reactivated">Account Reactivated</SelectItem>
                <SelectItem value="account_deleted">Account Deleted</SelectItem>
                <SelectItem value="email_changed">Email Changed</SelectItem>
                {/* Donation Actions */}
                <SelectItem value="donation_created">Donation Created</SelectItem>
                <SelectItem value="donation_confirmed">Donation Confirmed</SelectItem>
                <SelectItem value="donation_rejected">Donation Rejected</SelectItem>
                <SelectItem value="refund_requested">Refund Requested</SelectItem>
                <SelectItem value="refund_approved">Refund Approved</SelectItem>
                <SelectItem value="refund_rejected">Refund Rejected</SelectItem>
                {/* Campaign Actions */}
                <SelectItem value="campaign_created">Campaign Created</SelectItem>
                <SelectItem value="campaign_updated">Campaign Updated</SelectItem>
                <SelectItem value="campaign_activated">Campaign Activated</SelectItem>
                <SelectItem value="campaign_paused">Campaign Paused</SelectItem>
                <SelectItem value="campaign_deleted">Campaign Deleted</SelectItem>
                <SelectItem value="campaign_completed">Campaign Completed</SelectItem>
                {/* Charity Actions */}
                <SelectItem value="charity_created">Charity Created</SelectItem>
                <SelectItem value="charity_updated">Charity Updated</SelectItem>
                <SelectItem value="charity_approved">Charity Approved</SelectItem>
                <SelectItem value="charity_rejected">Charity Rejected</SelectItem>
                <SelectItem value="charity_suspended">Charity Suspended</SelectItem>
                <SelectItem value="charity_activated">Charity Activated</SelectItem>
                {/* Post/Update Actions */}
                <SelectItem value="post_created">Post Created</SelectItem>
                <SelectItem value="post_updated">Post Updated</SelectItem>
                <SelectItem value="post_deleted">Post Deleted</SelectItem>
                <SelectItem value="update_created">Update Created</SelectItem>
                <SelectItem value="update_updated">Update Updated</SelectItem>
                <SelectItem value="update_deleted">Update Deleted</SelectItem>
                <SelectItem value="comment_created">Comment Created</SelectItem>
                <SelectItem value="comment_updated">Comment Updated</SelectItem>
                <SelectItem value="comment_deleted">Comment Deleted</SelectItem>
                {/* Follow Actions */}
                <SelectItem value="charity_followed">Charity Followed</SelectItem>
                <SelectItem value="charity_unfollowed">Charity Unfollowed</SelectItem>
                {/* Document Actions */}
                <SelectItem value="document_uploaded">Document Uploaded</SelectItem>
                <SelectItem value="document_approved">Document Approved</SelectItem>
                <SelectItem value="document_rejected">Document Rejected</SelectItem>
                {/* Fund Usage Actions */}
                <SelectItem value="fund_usage_created">Fund Usage Created</SelectItem>
                <SelectItem value="fund_usage_updated">Fund Usage Updated</SelectItem>
                <SelectItem value="fund_usage_deleted">Fund Usage Deleted</SelectItem>
                {/* Admin Actions */}
                <SelectItem value="user_suspended">User Suspended</SelectItem>
                <SelectItem value="user_activated">User Activated</SelectItem>
                <SelectItem value="report_reviewed">Report Reviewed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="donor">Donors</SelectItem>
                <SelectItem value="charity_admin">Charities</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Action Logs ({(logs || []).length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(logs || []).map((log, index) => {
              const Icon = getActivityIcon(log.action_type);
              const colorClass = getActivityColor(log.action_type);
              
              return (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-all hover:border-indigo-300 bg-card"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-full ${colorClass} flex-shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getActionBadge(log.action_type)}
                            <span className="text-sm text-muted-foreground">
                              by
                            </span>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user.email}`} />
                                <AvatarFallback className="text-xs">
                                  {log.user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">{log.user.name}</span>
                                <span className="text-xs text-muted-foreground capitalize">{log.user.role}</span>
                              </div>
                            </div>
                          </div>
                          {log.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {log.description}
                            </p>
                          )}
                          {log.target_type && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Target:</span> {log.target_type} #{log.target_id}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p className="font-medium">{new Date(log.created_at).toLocaleString()}</p>
                          {log.ip_address && (
                            <p className="mt-1 flex items-center gap-1 justify-end">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                              {log.ip_address}
                            </p>
                          )}
                        </div>
                      </div>
                      {log.details && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-indigo-600 hover:underline font-medium">
                            View Details
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs overflow-auto border">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {(logs || []).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No action logs found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
