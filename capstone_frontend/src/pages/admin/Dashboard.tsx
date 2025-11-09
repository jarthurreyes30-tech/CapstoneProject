import { useEffect, useState } from "react";
import { Users, Building2, CheckCircle, DollarSign, Activity, Eye, UserCheck, UserX, Clock, RefreshCw, TrendingUp, AlertTriangle, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CustomChartTooltip } from "@/components/ui/enhanced-tooltip";

interface ChartData {
  month: string;
  charities: number;
  donors: number;
  total: number;
}

interface DonationData {
  month: string;
  amount: number;
  count: number;
}

interface DashboardMetrics {
  total_users: number;
  total_donors: number;
  total_charity_admins: number;
  charities: number;
  pending_verifications: number;
  campaigns: number;
  donations: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface Charity {
  id: number;
  name: string;
  contact_email: string;
  verification_status: string;
  created_at: string;
  owner?: {
    name: string;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [pendingCharities, setPendingCharities] = useState<Charity[]>([]);
  const [registrationData, setRegistrationData] = useState<ChartData[]>([]);
  const [donationData, setDonationData] = useState<DonationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchChartsData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch metrics
      const metricsResponse = await fetch(`${import.meta.env.VITE_API_URL}/metrics`);
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      // Fetch recent users
      // Check both localStorage and sessionStorage for token
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const usersResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        // Handle both array responses and Laravel paginator objects
        const usersArray = Array.isArray(usersData)
          ? usersData
          : Array.isArray(usersData?.data)
            ? usersData.data
            : [];
        setRecentUsers(usersArray.slice(0, 5)); // Show latest 5 users
      }

      // Fetch pending charities
      const charitiesResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/charities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (charitiesResponse.ok) {
        const charitiesData = await charitiesResponse.json();
        // Handle both array responses and Laravel paginator objects
        const charitiesArray = Array.isArray(charitiesData)
          ? charitiesData
          : Array.isArray(charitiesData?.data)
            ? charitiesData.data
            : [];
        const pending = charitiesArray.filter((c: Charity) => c.verification_status === 'pending');
        setPendingCharities(pending.slice(0, 5)); // Show latest 5 pending
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Set fallback empty arrays to prevent undefined errors
      setMetrics(null);
      setRecentUsers([]);
      setPendingCharities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartsData = async () => {
    try {
      setChartsLoading(true);
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      // Fetch registrations trend
      const regResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/registrations-trend`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (regResponse.ok) {
        const regData = await regResponse.json();
        setRegistrationData(regData.data || []);
      }
      
      // Fetch donations trend
      const donResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/donations-trend`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (donResponse.ok) {
        const donData = await donResponse.json();
        setDonationData(donData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch charts data:', error);
      toast.error('Failed to load charts data');
    } finally {
      setChartsLoading(false);
    }
  };

  const handleCharityAction = async (charityId: number, action: 'approve' | 'reject') => {
    setActionLoading(`${action}-${charityId}`);
    try {
      // Check both localStorage and sessionStorage for token
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/charities/${charityId}/${action}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Failed to ${action} charity`);
      
      toast.success(`Charity ${action}d successfully`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(`Failed to ${action} charity`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserAction = async (userId: number, action: 'suspend' | 'activate') => {
    setActionLoading(`${action}-${userId}`);
    try {
      // Check both localStorage and sessionStorage for token
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/${action}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Failed to ${action} user`);
      
      toast.success(`User ${action}d successfully`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Complete overview of your charity platform
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm" className="hover:scale-105 transition-transform">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer"
          onClick={() => navigate('/admin/users')}
        >
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-primary">{metrics?.total_users || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">All registered users</p>
                </div>
                <Users className="h-12 w-12 text-primary opacity-70" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer"
          onClick={() => navigate('/admin/users')}
        >
          <Card className="border-l-4 border-l-secondary hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-secondary">{metrics?.total_donors || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Registered donors</p>
                </div>
                <Heart className="h-12 w-12 text-secondary opacity-70" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer"
          onClick={() => navigate('/admin/charities')}
        >
          <Card className="border-l-4 border-l-accent-foreground hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Charity Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-accent-foreground">{metrics?.total_charity_admins || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Charity representatives</p>
                </div>
                <Building2 className="h-12 w-12 text-accent-foreground opacity-70" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer"
          onClick={() => navigate('/admin/charities')}
        >
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved Charities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-primary">{metrics?.charities || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Verified organizations</p>
                </div>
                <CheckCircle className="h-12 w-12 text-primary opacity-70" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer"
          onClick={() => navigate('/admin/charities')}
        >
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-primary">{metrics?.pending_verifications || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                </div>
                <AlertTriangle className="h-12 w-12 text-primary opacity-70" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* Left Column: Welcome Message + Pending Charities */}
        <div className="space-y-6">
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Welcome to Admin Dashboard
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Empowering generosity, one verified charity at a time.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pending Charities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="h-5 w-5" />
                  Pending Charity Verifications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {pendingCharities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No pending verifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(pendingCharities || []).map((charity, index) => (
                      <motion.div
                        key={charity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all hover:border-orange-300 bg-card"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{charity.name}</h4>
                          <p className="text-sm text-muted-foreground">{charity.contact_email}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Submitted {new Date(charity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleCharityAction(charity.id, 'approve')}
                            disabled={actionLoading === `approve-${charity.id}`}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {actionLoading === `approve-${charity.id}` ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCharityAction(charity.id, 'reject')}
                            disabled={actionLoading === `reject-${charity.id}`}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            {actionLoading === `reject-${charity.id}` ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserX className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Recent Users */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5" />
                Recent User Registrations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {recentUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent users</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(recentUsers || []).map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all hover:border-blue-300 bg-card"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={user.role === 'donor' ? 'default' : 'secondary'} className="capitalize">
                            {user.role.replace('_', ' ')}
                          </Badge>
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {user.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            disabled={actionLoading === `suspend-${user.id}`}
                            className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                          >
                            {actionLoading === `suspend-${user.id}` ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserX className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'activate')}
                            disabled={actionLoading === `activate-${user.id}`}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {actionLoading === `activate-${user.id}` ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Charity & Donor Registrations Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5" />
                Charity & Donor Registrations Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-muted-foreground">Loading chart...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={registrationData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      content={<CustomChartTooltip type="registrations" />}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="charities" 
                      stroke="#9333ea" 
                      strokeWidth={2}
                      dot={{ fill: "#9333ea", r: 4 }}
                      name="Charities"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="donors" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 4 }}
                      name="Donors"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Donations Received Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <DollarSign className="h-5 w-5" />
                Donations Received Trend
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Total donations received by all charities monthly</p>
            </CardHeader>
            <CardContent className="pt-6">
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-muted-foreground">Loading chart...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={donationData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      content={<CustomChartTooltip type="donations" valuePrefix="₱" />}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="#16a34a" 
                      radius={[8, 8, 0, 0]}
                      name="Total Amount"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
