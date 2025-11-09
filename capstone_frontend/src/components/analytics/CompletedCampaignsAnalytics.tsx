import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { CheckCircle, TrendingUp, MapPin, Users, Coins, AlertTriangle, Info } from 'lucide-react';
import { buildApiUrl, getAuthToken } from '@/lib/api';
import { toast } from 'sonner';
import { CustomChartTooltip } from '@/components/ui/enhanced-tooltip';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

interface CompletedCampaignsData {
  summary: {
    total_campaigns: number;
    total_post_completion_donations: number;
    total_post_completion_amount: number;
    total_overflow_amount: number;
    total_target_amount: number;
    total_received_amount: number;
    period_days: number;
  };
  by_type: Array<{
    type: string;
    label: string;
    count: number;
    total_amount: number;
  }>;
  by_beneficiary: Array<{
    beneficiary: string;
    count: number;
    total_amount: number;
  }>;
  by_location: Array<{
    region: string;
    count: number;
    total_amount: number;
    cities: string[];
  }>;
  campaigns: Array<{
    id: number;
    title: string;
    charity: string;
    type: string;
    beneficiary: string;
    location: string;
    region: string;
    province: string;
    city: string;
    status: string;
    target_amount: number;
    total_received: number;
    overflow_amount: number;
    progress_percentage: number;
    post_completion_donations: number;
    post_completion_amount: number;
  }>;
}

export default function CompletedCampaignsAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CompletedCampaignsData | null>(null);
  const [days, setDays] = useState(90);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch(buildApiUrl(`/analytics/campaigns/completed-receiving-donations?days=${days}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch analytics');

      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching completed campaigns analytics:', error);
      toast.error('Failed to load completed campaigns analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!data || data.summary.total_campaigns === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No completed campaigns have received donations in the last {days} days.
        </AlertDescription>
      </Alert>
    );
  }

  const { summary, by_type, by_beneficiary, by_location, campaigns } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Completed Campaigns Still Receiving Donations
          </h2>
          <p className="text-muted-foreground mt-1">
            Analysis of closed/completed campaigns that continue to receive donations
          </p>
        </div>
        <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="60">Last 60 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Campaigns</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_campaigns}</div>
            <p className="text-xs text-muted-foreground">
              Still receiving donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Post-Completion Donations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_post_completion_donations}</div>
            <p className="text-xs text-muted-foreground">
              After campaign ended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Amount Received</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{summary.total_post_completion_amount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              In the last {summary.period_days} days
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Total Overflow Beyond Goals</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">₱{summary.total_overflow_amount.toLocaleString()}</div>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Donations beyond 100% target
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Target: ₱{summary.total_target_amount.toLocaleString()} • 
              Received: ₱{summary.total_received_amount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insight Card */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
            <CheckCircle className="h-5 w-5" />
            Campaign Completion Analysis
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            These campaigns reached their 100% funding goal but continue to receive donations beyond their target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Average Overflow</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.total_campaigns > 0 
                  ? `₱${(summary.total_post_completion_amount / summary.total_campaigns).toLocaleString(undefined, {maximumFractionDigits: 0})}`
                  : '₱0'
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">Per campaign beyond goal</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Avg Donations per Campaign</p>
              <p className="text-2xl font-bold text-blue-600">
                {summary.total_campaigns > 0 
                  ? (summary.total_post_completion_donations / summary.total_campaigns).toFixed(1)
                  : '0'
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">After reaching 100%</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-purple-600">100%</p>
              <p className="text-xs text-muted-foreground mt-1">All analyzed reached goal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>By Campaign Type</CardTitle>
            <CardDescription>Common types of completed campaigns still receiving support</CardDescription>
          </CardHeader>
          <CardContent>
            {by_type.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={by_type}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ label, count }) => `${label} (${count})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {by_type.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip type="campaigns" valueSuffix=" campaigns" />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Amount Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Post-Completion Amount by Type</CardTitle>
            <CardDescription>Total overflow donations received by campaign type</CardDescription>
          </CardHeader>
          <CardContent>
            {by_type.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={by_type}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="label" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    content={<CustomChartTooltip type="donations" valuePrefix="₱" />}
                  />
                  <Bar dataKey="total_amount" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Beneficiary Analysis - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Beneficiary Groups
          </CardTitle>
          <CardDescription>Beneficiary categories most commonly supported beyond campaign goals</CardDescription>
        </CardHeader>
        <CardContent>
          {by_beneficiary.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={by_beneficiary.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`} />
                <YAxis 
                  type="category" 
                  dataKey="beneficiary" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  content={<CustomChartTooltip type="beneficiary" valuePrefix="₱" />}
                />
                <Legend />
                <Bar dataKey="total_amount" fill="#0088FE" name="Total Amount" />
                <Bar dataKey="count" fill="#00C49F" name="Campaign Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Location Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>Regions where completed campaigns continue receiving support</CardDescription>
        </CardHeader>
        <CardContent>
          {by_location.length > 0 ? (
            <div className="space-y-4">
              {by_location.map((location, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{location.region || 'Unknown Region'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {location.count} campaign{location.count > 1 ? 's' : ''} • 
                        ₱{location.total_amount.toLocaleString()} received
                      </p>
                      {location.cities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {location.cities.map((city, cidx) => (
                            <Badge key={cidx} variant="secondary" className="text-xs">
                              {city}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No location data available</p>
          )}
        </CardContent>
      </Card>

      {/* Campaign Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>Individual completed campaigns still receiving donations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Campaign</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-right py-2 px-4">Target</th>
                  <th className="text-right py-2 px-4">Total Received</th>
                  <th className="text-right py-2 px-4">Overflow</th>
                  <th className="text-right py-2 px-4">Progress</th>
                  <th className="text-left py-2 px-4">Location</th>
                  <th className="text-right py-2 px-4">Recent Donations</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{campaign.title}</p>
                        <p className="text-xs text-muted-foreground">{campaign.charity}</p>
                        {campaign.beneficiary && (
                          <p className="text-xs text-muted-foreground mt-1">→ {campaign.beneficiary}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{campaign.type?.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-sm">₱{campaign.target_amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">₱{campaign.total_received.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-amber-600">+₱{campaign.overflow_amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        {campaign.progress_percentage.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{campaign.location || 'N/A'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="text-sm font-medium">{campaign.post_completion_donations} donations</div>
                      <div className="text-xs text-muted-foreground">₱{campaign.post_completion_amount.toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          <strong>Insight:</strong> These campaigns have reached their 100% funding goal but continue to receive donations beyond their target amount. 
          This indicates strong donor loyalty, exceptional campaign impact, or donors who want to support successful causes even after completion. 
          These "overflow" donations show that supporters believe in your mission and want to maximize impact. 
          Consider creating follow-up campaigns or expansion projects to channel this ongoing support.
        </AlertDescription>
      </Alert>
    </div>
  );
}
