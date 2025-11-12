import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, TrendingUp, MapPin, Target, Calendar, Award, BarChart3 } from 'lucide-react';
import { buildApiUrl, getAuthToken } from '@/lib/api';
import { toast } from 'sonner';
import { CustomChartTooltip } from '@/components/ui/enhanced-tooltip';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#FF6B6B', '#4ECDC4'];

interface CampaignTypeInsight {
  type: string;
  label: string;
  total_campaigns: number;
  creation_frequency: {
    type: 'weekly' | 'monthly';
    data: Array<{ period: string; count: number }>;
    average_per_week?: number;
    average_per_month?: number;
  };
  top_charities: Array<{
    charity_id: number;
    charity_name: string;
    campaign_count: number;
  }>;
  funding_stats: {
    avg_goal: number;
    min_goal: number;
    max_goal: number;
    total_raised: number;
    avg_raised: number;
  };
  frequent_locations: Array<{
    city: string;
    province: string;
    region: string;
    count: number;
    full_location: string;
  }>;
}

export default function CampaignTypeInsights() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<CampaignTypeInsight[]>([]);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchInsights();
  }, [period]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;

      const params = new URLSearchParams();
      params.append('period', period);
      if (user?.charity?.id) {
        params.append('charity_id', user.charity.id.toString());
      }

      const response = await fetch(buildApiUrl(`/analytics/campaign-type-insights?${params}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.data || []);
        if (data.data && data.data.length > 0 && !selectedType) {
          setSelectedType(data.data[0].type);
        }
      }
    } catch (error) {
      console.error('Campaign type insights error:', error);
      toast.error('Failed to load campaign type insights');
    } finally {
      setLoading(false);
    }
  };

  const selectedInsight = insights.find(i => i.type === selectedType);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No campaign type data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Campaign Type Analysis</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Comprehensive insights into campaign types, creation patterns, and performance
          </p>
        </div>
        <Select value={period} onValueChange={(val) => setPeriod(val as 'weekly' | 'monthly')}>
          <SelectTrigger className="h-10 w-[160px] sm:w-[180px] shrink-0 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent 
            position="popper" 
            side="bottom" 
            align="start" 
            className="w-56 max-w-[95vw] z-[60]"
          >
            <SelectItem value="weekly">Weekly View</SelectItem>
            <SelectItem value="monthly">Monthly View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Type Distribution Overview */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Campaign Type Distribution
          </CardTitle>
          <CardDescription>Overview of all campaign types and their volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insights}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" className="fill-muted-foreground" />
              <YAxis className="fill-muted-foreground" />
              <Tooltip
                content={<CustomChartTooltip type="campaigns" valueSuffix=" campaigns" />}
              />
              <Bar dataKey="total_campaigns" fill="#0088FE" name="Total Campaigns" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Type Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {insights.map((insight) => (
              <Badge
                key={insight.type}
                variant={selectedType === insight.type ? 'default' : 'outline'}
                className="cursor-pointer text-sm py-2 px-4 hover:bg-primary/20 transition-colors"
                onClick={() => setSelectedType(insight.type)}
              >
                {insight.label} ({insight.total_campaigns})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed View for Selected Type */}
      {selectedInsight && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Campaigns</p>
                    <p className="text-3xl font-bold text-blue-400 mt-1">
                      {selectedInsight.total_campaigns}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Goal</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">
                      ₱{selectedInsight.funding_stats.avg_goal.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Raised</p>
                    <p className="text-2xl font-bold text-purple-400 mt-1">
                      ₱{selectedInsight.funding_stats.total_raised.toLocaleString()}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg per {period === 'weekly' ? 'Week' : 'Month'}
                    </p>
                    <p className="text-3xl font-bold text-orange-400 mt-1">
                      {period === 'weekly'
                        ? selectedInsight.creation_frequency.average_per_week?.toFixed(1)
                        : selectedInsight.creation_frequency.average_per_month?.toFixed(1)}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Creation Frequency Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Creation Frequency ({period === 'weekly' ? 'Last 12 Weeks' : 'Last 12 Months'})
              </CardTitle>
              <CardDescription>
                Track how often {selectedInsight.label.toLowerCase()} campaigns are created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={selectedInsight.creation_frequency.data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="fill-muted-foreground" />
                  <YAxis className="fill-muted-foreground" />
                  <Tooltip
                    content={<CustomChartTooltip type="campaigns" valueSuffix=" campaigns" />}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0088FE"
                    strokeWidth={2}
                    dot={{ fill: '#0088FE', r: 4 }}
                    name="Campaigns Created"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Charities and Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Charities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Top Charities
                </CardTitle>
                <CardDescription>
                  Organizations creating the most {selectedInsight.label.toLowerCase()} campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedInsight.top_charities.length > 0 ? (
                  <div className="space-y-3">
                    {selectedInsight.top_charities.map((charity, index) => (
                      <div
                        key={charity.charity_id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{charity.charity_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {charity.campaign_count} campaign{charity.campaign_count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{charity.campaign_count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* Frequent Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Frequent Locations
                </CardTitle>
                <CardDescription>
                  Where {selectedInsight.label.toLowerCase()} campaigns are most common
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedInsight.frequent_locations.length > 0 ? (
                  <div className="space-y-3">
                    {selectedInsight.frequent_locations.map((location, index) => (
                      <div
                        key={`${location.city}-${index}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{location.city}</p>
                            <p className="text-sm text-muted-foreground">{location.province}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{location.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No location data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Funding Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Funding Statistics
              </CardTitle>
              <CardDescription>
                Goal amounts and fundraising performance for {selectedInsight.label.toLowerCase()} campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Goal Range</p>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-muted-foreground">Min:</span>
                      <span className="text-lg font-semibold">
                        ₱{selectedInsight.funding_stats.min_goal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-muted-foreground">Avg:</span>
                      <span className="text-lg font-semibold text-primary">
                        ₱{selectedInsight.funding_stats.avg_goal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-muted-foreground">Max:</span>
                      <span className="text-lg font-semibold">
                        ₱{selectedInsight.funding_stats.max_goal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Raised</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    ₱{selectedInsight.funding_stats.total_raised.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Avg Raised per Campaign</p>
                  <p className="text-3xl font-bold text-purple-400">
                    ₱{selectedInsight.funding_stats.avg_raised.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
