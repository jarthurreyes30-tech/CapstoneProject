import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Users,
  Target,
  BarChart3,
  PieChart,
  FileText,
  Award,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Sparkles,
  CheckCircle,
  Percent,
  Heart,
  MapPin,
  Info,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer, Cell } from 'recharts';
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { donationsService } from "@/services/donations";
import { buildApiUrl, getAuthToken } from '@/lib/api';
import { getBeneficiaryLabel } from '@/constants/beneficiaryCategories';
import { motion, AnimatePresence } from 'framer-motion';
import LocationMap from '@/components/analytics/LocationMap';
import LocationFilters from '@/components/analytics/LocationFilters';
import LocationSummaryCards from '@/components/analytics/LocationSummaryCards';
import OverviewSummary from '@/components/analytics/OverviewSummary';
import TrendsAndTimingTab from '@/components/analytics/TrendsAndTimingTab';
import OverviewTab from '@/components/analytics/OverviewTab';
import GeographicInsightsTab from '@/components/analytics/GeographicInsightsTab';
import CampaignTypeInsights from '@/components/analytics/CampaignTypeInsights';
import { Skeleton } from '@/components/ui/skeleton';
import CompletedCampaignsAnalytics from '@/components/analytics/CompletedCampaignsAnalytics';

interface DonorStats {
  name: string;
  email?: string;
  total: number;
  count: number;
}

interface CampaignStats {
  title: string;
  total: number;
  count: number;
}

export default function ReportsAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("month");
  const [donations, setDonations] = useState<any[]>([]);
  
  // Campaign Analytics State
  const [campaignTypes, setCampaignTypes] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [typeStats, setTypeStats] = useState<any>(null);
  const [advancedStats, setAdvancedStats] = useState<any>(null);
  const [trendingExplanation, setTrendingExplanation] = useState<string>('');
  const [trendingDays, setTrendingDays] = useState(30);
  const [summaryMetrics, setSummaryMetrics] = useState<any>(null);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [temporalTrends, setTemporalTrends] = useState<any[]>([]);
  const [fundRanges, setFundRanges] = useState<any[]>([]);
  const [beneficiaryData, setBeneficiaryData] = useState<any[]>([]);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [growthByType, setGrowthByType] = useState<any[]>([]);
  const [mostImproved, setMostImproved] = useState<any>(null);
  const [activityTimeline, setActivityTimeline] = useState<any[]>([]);
  const [timelineView, setTimelineView] = useState<'campaigns' | 'donations'>('donations');
  const [timelineDays, setTimelineDays] = useState(30);
  const [locationSummary, setLocationSummary] = useState({ regions: 0, provinces: 0, cities: 0, campaigns: 0 });
  const [locationFilters, setLocationFilters] = useState<{ regions: string[]; provinces: string[]; cities: string[] }>({ 
    regions: [], 
    provinces: [], 
    cities: [] 
  });
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [filteredLocationData, setFilteredLocationData] = useState<any[]>([]);
  
  // General Donation Analytics State
  const [generalDonations, setGeneralDonations] = useState<any[]>([]);
  const [generalDonationStats, setGeneralDonationStats] = useState<any>(null);
  const [donationRanges, setDonationRanges] = useState<any[]>([]);
  const [showGoalComputation, setShowGoalComputation] = useState(false);
  const [goalComputationDetails, setGoalComputationDetails] = useState<any>(null);

  useEffect(() => {
    loadData();
    fetchCampaignAnalytics();
  }, []);
  
  useEffect(() => {
    if (selectedType !== 'all') {
      fetchTypeStats(selectedType);
      fetchAdvancedStats(selectedType);
      fetchTrendingExplanation(selectedType);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchTrending();
  }, [trendingDays]);
  
  useEffect(() => {
    fetchEnhancedTrendingAnalytics();
  }, []);
  
  useEffect(() => {
    fetchActivityTimeline();
  }, [timelineDays]);
  
  useEffect(() => {
    fetchLocationSummary();
    fetchLocationFilters();
  }, []);

  useEffect(() => {
    fetchLocationFilters();
    fetchFilteredLocationData();
  }, [selectedRegion, selectedProvince, selectedCity]);

  const loadData = async () => {
    try {
      if (!user?.charity?.id) return;
      const response = await donationsService.getCharityDonations(user.charity.id);
      setDonations(response.data);
      computeGeneralDonationAnalytics(response.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const computeGeneralDonationAnalytics = (allDonations: any[]) => {
    // Filter general donations (donations without campaign_id)
    const general = allDonations.filter(d => !d.campaign_id && d.status === 'completed');
    setGeneralDonations(general);

    if (general.length === 0) {
      setGeneralDonationStats(null);
      return;
    }

    // Calculate total and average
    const totalAmount = general.reduce((sum, d) => sum + d.amount, 0);
    const avgAmount = totalAmount / general.length;

    // Find most common donation range
    const ranges = [
      { label: '₱1 - ₱500', min: 1, max: 500, count: 0, total: 0 },
      { label: '₱501 - ₱1,000', min: 501, max: 1000, count: 0, total: 0 },
      { label: '₱1,001 - ₱5,000', min: 1001, max: 5000, count: 0, total: 0 },
      { label: '₱5,001 - ₱10,000', min: 5001, max: 10000, count: 0, total: 0 },
      { label: '₱10,001+', min: 10001, max: Infinity, count: 0, total: 0 },
    ];

    general.forEach(d => {
      const amount = d.amount;
      const range = ranges.find(r => amount >= r.min && amount <= r.max);
      if (range) {
        range.count++;
        range.total += amount;
      }
    });

    setDonationRanges(ranges.filter(r => r.count > 0));

    // Find typical range (most common)
    const typicalRange = ranges.reduce((max, r) => r.count > max.count ? r : max, ranges[0]);

    setGeneralDonationStats({
      totalAmount,
      avgAmount,
      count: general.length,
      typicalRange: typicalRange.label,
      typicalRangeCount: typicalRange.count,
    });
  };

  // Calculate statistics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const stats = {
    totalDonations: donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0),
    totalCount: donations.filter(d => d.status === 'completed').length,
    avgDonation: donations.length > 0 
      ? donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0) / donations.filter(d => d.status === 'completed').length
      : 0,
    thisMonth: donations.filter(d => {
      const date = new Date(d.donated_at);
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear &&
             d.status === 'completed';
    }).reduce((sum, d) => sum + d.amount, 0),
    lastMonth: donations.filter(d => {
      const date = new Date(d.donated_at);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === lastMonth && 
             date.getFullYear() === lastMonthYear &&
             d.status === 'completed';
    }).reduce((sum, d) => sum + d.amount, 0),
  };

  const monthlyGrowth = stats.lastMonth > 0 
    ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100 
    : 0;

  // Top donors
  const donorMap = donations.reduce((acc, d) => {
    if (d.status !== 'completed' || d.is_anonymous) return acc;
    const donorId = d.donor?.id || 'unknown';
    if (!acc[donorId]) {
      acc[donorId] = {
        name: d.donor?.name || 'Unknown',
        email: d.donor?.email,
        total: 0,
        count: 0,
      };
    }
    acc[donorId].total += d.amount;
    acc[donorId].count += 1;
    return acc;
  }, {} as Record<string, DonorStats>);

  const topDonors = (Object.values(donorMap) as DonorStats[])
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Top campaigns
  const campaignMap = donations.reduce((acc, d) => {
    if (d.status !== 'completed') return acc;
    const campaignId = d.campaign?.id || 'general';
    if (!acc[campaignId]) {
      acc[campaignId] = {
        title: d.campaign?.title || 'General Donations',
        total: 0,
        count: 0,
      };
    }
    acc[campaignId].total += d.amount;
    acc[campaignId].count += 1;
    return acc;
  }, {} as Record<string, CampaignStats>);

  const topCampaigns = (Object.values(campaignMap) as CampaignStats[])
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Monthly donations for chart
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i;
    const total = donations.filter(d => {
      const date = new Date(d.donated_at);
      return date.getMonth() === month && 
             date.getFullYear() === currentYear &&
             d.status === 'completed';
    }).reduce((sum, d) => sum + d.amount, 0);
    return { month: new Date(currentYear, month).toLocaleString('default', { month: 'short' }), total };
  });

  const maxMonthly = Math.max(...monthlyData.map(d => d.total), 1);

  // Donation sources
  const sources = {
    oneTime: donations.filter(d => !d.is_recurring && d.status === 'completed').length,
    recurring: donations.filter(d => d.is_recurring && d.status === 'completed').length,
  };

  const handleExport = (format: string) => {
    toast.info(`Exporting ${format.toUpperCase()} report...`);
    // TODO: Implement actual export
  };
  
  // Campaign Analytics Functions
  const fetchCampaignAnalytics = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const charityParams = user?.charity?.id ? `?charity_id=${user.charity.id}` : '';
      
      const [typesRes, summaryRes, locationRes, trendsRes, rangesRes, beneficiariesRes, overviewRes] = await Promise.all([
        fetch(buildApiUrl(`/analytics/campaigns/types${charityParams}`), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl(`/analytics/summary${charityParams}`), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl(`/analytics/campaigns/locations${charityParams}`), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl(`/analytics/campaigns/temporal${charityParams}`), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl(`/analytics/campaigns/fund-ranges${charityParams}`), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl(`/analytics/campaigns/beneficiaries${charityParams}`), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl(`/analytics/overview${charityParams}`), { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const typesData = await typesRes.json();
      setCampaignTypes(typesData.data || []);
      
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummaryMetrics(summaryData.data || summaryData);
      }
      
      if (locationRes.ok) {
        const locationData = await locationRes.json();
        const dataArray = Array.isArray(locationData) ? locationData : (locationData.data || []);
        setLocationData(dataArray);
      }
      
      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        setTemporalTrends(trendsData.data || []);
      }
      
      if (rangesRes.ok) {
        const rangesData = await rangesRes.json();
        setFundRanges(rangesData.data || []);
      }
      
      if (beneficiariesRes.ok) {
        const beneficiariesData = await beneficiariesRes.json();
        setBeneficiaryData(Array.isArray(beneficiariesData) ? beneficiariesData : (beneficiariesData.data || []));
      }
      
      if (overviewRes.ok) {
        const overviewResData = await overviewRes.json();
        setOverviewData(overviewResData);
      }

      await fetchTrending();
      await computeAndSetSummaryMetrics();
    } catch (error) {
      console.error('Campaign analytics error:', error);
    }
  };

  const fetchTrending = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(buildApiUrl(`/analytics/campaigns/trending?days=${trendingDays}&limit=5`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTrending(data.data || []);
    } catch (error) {
      console.error('Trending error:', error);
    }
  };

  const computeAndSetSummaryMetrics = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const meRes = await fetch(buildApiUrl('/me'), {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!meRes.ok) return;
      const me = await meRes.json();
      const charityId = me?.charity?.id || me?.charity_id || me?.id;
      if (!charityId) return;

      const [donationsRes, campaignsRes] = await Promise.all([
        fetch(buildApiUrl(`/charities/${charityId}/donations`), {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        }),
        fetch(buildApiUrl(`/charities/${charityId}/campaigns`), {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        }),
      ]);

      let donations: any[] = [];
      if (donationsRes.ok) {
        const dData = await donationsRes.json();
        donations = dData.data || dData || [];
      }

      let campaigns: any[] = [];
      if (campaignsRes.ok) {
        const cData = await campaignsRes.json();
        campaigns = cData.data || cData || [];
      }

      const normalizeStatus = (s: any) => String(s || '').toLowerCase();
      const isVerifiedDonation = (d: any) => {
        const s = normalizeStatus(d.status);
        return s === 'confirmed' || s === 'completed' || s === 'verified';
      };

      const toAmount = (x: any) => {
        const n = parseFloat(x ?? 0);
        return isNaN(n) ? 0 : n;
      };

      const verified = donations.filter((d) => {
        const linked = d.campaign_id || d.campaign?.id;
        return linked && isVerifiedDonation(d);
      });
      const totalRaised = verified.reduce((sum, d) => sum + toAmount(d.amount), 0);
      const totalVerifiedDonations = verified.length;
      const avgDonation = totalVerifiedDonations > 0 ? totalRaised / totalVerifiedDonations : 0;

      const raisedByCampaign = new Map<number, number>();
      verified.forEach((d) => {
        const cid = d.campaign_id || d.campaign?.id;
        if (!cid) return;
        raisedByCampaign.set(cid, (raisedByCampaign.get(cid) || 0) + toAmount(d.amount));
      });

      const ratios: number[] = [];
      const campaignDetails: any[] = [];
      campaigns.forEach((c: any) => {
        const goal = toAmount(c.target_amount ?? c.goal_amount);
        if (goal > 0) {
          const cid = c.id;
          const raised = raisedByCampaign.get(cid) ?? 0;
          const percentage = (raised / goal) * 100;
          ratios.push(percentage);
          campaignDetails.push({
            title: c.title,
            goal,
            raised,
            percentage: percentage.toFixed(2),
          });
        }
      });

      const avg_goal_achievement = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;

      // Store detailed computation
      setGoalComputationDetails({
        campaigns: campaignDetails,
        totalCampaigns: campaignDetails.length,
        sumOfPercentages: ratios.reduce((a, b) => a + b, 0).toFixed(2),
        averagePercentage: avg_goal_achievement.toFixed(2),
        formula: `Sum of all campaign percentages ÷ Number of campaigns = Average Goal %`,
      });

      setSummaryMetrics((prev: any) => ({
        ...(prev || {}),
        total_raised: totalRaised,
        avg_donation: avgDonation,
        avg_goal_achievement,
        verified_donations: totalVerifiedDonations,
        campaign_count: campaigns.length,
      }));

      const beneficiaryMap = new Map<string, number>();
      campaigns.forEach((c: any) => {
        const categories = c.beneficiary_category || [];
        if (Array.isArray(categories)) {
          categories.forEach((cat: string) => {
            beneficiaryMap.set(cat, (beneficiaryMap.get(cat) || 0) + 1);
          });
        }
      });

      const beneficiaryBreakdown = Array.from(beneficiaryMap.entries())
        .map(([value, count]) => ({
          value,
          label: getBeneficiaryLabel(value),
          count,
        }))
        .sort((a, b) => b.count - a.count);

      setBeneficiaryData(beneficiaryBreakdown);
    } catch (err) {
      console.error('Failed computing summary metrics:', err);
    }
  };

  const fetchTypeStats = async (type: string) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(buildApiUrl(`/analytics/campaigns/${type}/stats`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTypeStats(data);
    } catch (error) {
      console.error('Type stats error:', error);
    }
  };

  const fetchAdvancedStats = async (type: string) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(buildApiUrl(`/analytics/campaigns/${type}/advanced`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAdvancedStats(data);
    } catch (error) {
      console.error('Advanced stats error:', error);
    }
  };

  const fetchTrendingExplanation = async (type: string) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(buildApiUrl(`/analytics/trending-explanation/${type}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTrendingExplanation(data.explanation || '');
    } catch (error) {
      console.error('Trending explanation error:', error);
    }
  };
  
  const fetchEnhancedTrendingAnalytics = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const [growthRes, improvedRes] = await Promise.all([
        fetch(buildApiUrl('/analytics/growth-by-type'), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(buildApiUrl('/analytics/most-improved'), { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      if (growthRes.ok) {
        const growthData = await growthRes.json();
        setGrowthByType(growthData.data || []);
      }
      
      if (improvedRes.ok) {
        const improvedData = await improvedRes.json();
        setMostImproved(improvedData.data || null);
      }
    } catch (error) {
      console.error('Enhanced trending analytics error:', error);
    }
  };
  
  const fetchActivityTimeline = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(
        buildApiUrl(`/analytics/activity-timeline?days=${timelineDays}&group_by=day`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.ok) {
        const data = await res.json();
        setActivityTimeline(data.data || []);
      }
    } catch (error) {
      console.error('Activity timeline error:', error);
    }
  };
  
  const fetchLocationSummary = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const params = new URLSearchParams();
      if (user?.charity?.id) params.append('charity_id', user.charity.id.toString());
      
      const response = await fetch(
        buildApiUrl(`/analytics/campaigns/location-summary?${params}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setLocationSummary(data);
      }
    } catch (error) {
      console.error('Failed to load location summary:', error);
    }
  };

  const fetchLocationFilters = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const params = new URLSearchParams();
      if (user?.charity?.id) params.append('charity_id', user.charity.id.toString());
      if (selectedRegion) params.append('region', selectedRegion);
      if (selectedProvince) params.append('province', selectedProvince);
      
      const response = await fetch(
        buildApiUrl(`/analytics/campaigns/location-filters?${params}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setLocationFilters(data);
      }
    } catch (error) {
      console.error('Failed to load location filters:', error);
    }
  };

  const fetchFilteredLocationData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const params = new URLSearchParams();
      if (user?.charity?.id) params.append('charity_id', user.charity.id.toString());
      if (selectedRegion) params.append('region', selectedRegion);
      if (selectedProvince) params.append('province', selectedProvince);
      if (selectedCity) params.append('city', selectedCity);
      
      const response = await fetch(
        buildApiUrl(`/analytics/campaigns/by-location?${params}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        const processedData = Array.isArray(data) ? data : [];
        setFilteredLocationData(processedData);
      }
    } catch (error) {
      console.error('Failed to load filtered location data:', error);
    }
  };
  
  const handleClearLocationFilters = () => {
    setSelectedRegion('');
    setSelectedProvince('');
    setSelectedCity('');
  };

  const generateInsight = () => {
    if (campaignTypes.length === 0) return "No campaign data available yet.";
    
    const topType = campaignTypes[0];
    const total = campaignTypes.reduce((sum, t) => sum + t.count, 0);
    
    return `${topType.label} campaigns are the most common with ${topType.count} campaigns (${Math.round((topType.count / total) * 100)}% of total). Total active campaigns: ${total}.`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" style={{ scrollbarGutter: 'stable both-edges' }}>
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Reports & Analytics</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Track donation performance, campaign effectiveness, and generate transparency reports
              </p>
            </div>
            <div className="flex flex-row flex-nowrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-start lg:justify-end overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] min-w-max">
              <Button
                className="h-10 shrink-0 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
                onClick={async () => {
                  try {
                    const token = getAuthToken();
                    if (!token) {
                      toast.error('Please login to download analytics');
                      return;
                    }
                    
                    const response = await fetch(buildApiUrl('/charity/campaign-analytics/export-pdf'), {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/pdf',
                      },
                      method: 'GET',
                    });
                    
                    if (!response.ok) {
                      throw new Error(`Failed to download: ${response.status}`);
                    }
                    
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `campaign_analytics_${new Date().toISOString().split('T')[0]}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Campaign Analytics PDF downloaded successfully!');
                  } catch (error: any) {
                    console.error('Download error:', error);
                    toast.error(error.message || 'Failed to download campaign analytics');
                  }
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download Analytics (PDF)</span>
                  <span className="sm:hidden">Download PDF</span>
                </div>
              </Button>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="h-10 w-[160px] sm:w-[180px] shrink-0 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent 
                  position="popper" 
                  side="bottom" 
                  align="start" 
                  className="w-56 max-w-[95vw] z-[60]"
                >
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="donations" className="w-full">
        <div className="border-b bg-background/95">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <TabsList className="!block !bg-transparent !p-0 !rounded-none !justify-start h-auto w-full overflow-x-auto whitespace-nowrap px-2 [-ms-overflow-style:none] [scrollbar-width:none]" role="tablist">
              <div className="inline-flex min-w-max items-center gap-2 sm:gap-4">
                <TabsTrigger 
                  value="donations" 
                  role="tab" 
                  className="rounded-none border-b-2 border-transparent px-3 sm:px-4 py-3 text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent shrink-0"
                >
                  Donation Reports
                </TabsTrigger>
                <TabsTrigger 
                  value="campaigns" 
                  role="tab" 
                  className="rounded-none border-b-2 border-transparent px-3 sm:px-4 py-3 text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent shrink-0"
                >
                  Campaign Analytics
                </TabsTrigger>
              </div>
            </TabsList>
          </div>
        </div>

        {/* Donation Reports Tab */}
        <TabsContent value="donations" role="tabpanel" className="mt-0">

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Donations */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Donations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    ₱{stats.totalDonations.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All time confirmed
                  </p>
                </CardContent>
              </Card>

              {/* This Month */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₱{stats.thisMonth.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {monthlyGrowth >= 0 ? (
                      <>
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">
                          +{monthlyGrowth.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                        <span className="text-xs text-red-600 font-medium">
                          {monthlyGrowth.toFixed(1)}%
                        </span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              {/* Average Donation */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Donation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₱{stats.avgDonation.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per donation
                  </p>
                </CardContent>
              </Card>

              {/* Total Count */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Donations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Confirmed donations
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Monthly Donations Overview
                </CardTitle>
                <CardDescription>
                  Donation trends over the past 12 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Bar Chart */}
                <div className="space-y-4">
                  <div className="flex items-end justify-between h-64 gap-2">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col items-center">
                          <span className="text-xs font-medium mb-1">
                            {data.total > 0 ? `₱${(data.total / 1000).toFixed(0)}k` : ''}
                          </span>
                          <div
                            className="w-full bg-primary rounded-t transition-all hover:bg-primary/80 cursor-pointer"
                            style={{
                              height: `${(data.total / maxMonthly) * 200}px`,
                              minHeight: data.total > 0 ? '8px' : '0px',
                            }}
                            title={`${data.month}: ₱${data.total.toLocaleString()}`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {data.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donation Sources & Fund Allocation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Donation Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Donation Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>One-Time Donations</span>
                        <span className="font-medium">{sources.oneTime}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width: `${(sources.oneTime / (sources.oneTime + sources.recurring)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Recurring Donations</span>
                        <span className="font-medium">{sources.recurring}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{
                            width: `${(sources.recurring / (sources.oneTime + sources.recurring)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Success Rates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Campaign Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topCampaigns.slice(0, 3).map((campaign, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate">{campaign.title}</span>
                          <span className="font-medium">₱{(campaign.total / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600 rounded-full transition-all"
                            style={{
                              width: `${Math.min((campaign.total / topCampaigns[0].total) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyGrowth > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Positive Growth Trend</p>
                        <p className="text-sm text-muted-foreground">
                          This month's donations increased by {monthlyGrowth.toFixed(1)}% compared to last month.
                          Keep up the great work!
                        </p>
                      </div>
                    </div>
                  )}
                  {topCampaigns.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                      <Award className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Top Performing Campaign</p>
                        <p className="text-sm text-muted-foreground">
                          "{topCampaigns[0].title}" is performing exceptionally well with ₱
                          {topCampaigns[0].total.toLocaleString()} raised. Consider promoting similar campaigns.
                        </p>
                      </div>
                    </div>
                  )}
                  {sources.recurring > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Recurring Donor Base</p>
                        <p className="text-sm text-muted-foreground">
                          You have {sources.recurring} recurring donors. Focus on retention strategies to maintain
                          this sustainable income stream.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* General Donations Analytics */}
            {generalDonationStats && (
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-emerald-600" />
                    General Donations Analytics
                  </CardTitle>
                  <CardDescription>
                    Donations made directly to your charity (not linked to specific campaigns)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground">Total General Donations</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          ₱{generalDonationStats.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground">Average Amount</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          ₱{generalDonationStats.avgAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground">Total Count</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {generalDonationStats.count}
                        </p>
                      </div>
                    </div>

                    {/* Typical Range */}
                    <div className="p-4 bg-background rounded-lg border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-emerald-600" />
                        <p className="font-semibold text-sm">Most Common Donation Range</p>
                      </div>
                      <p className="text-lg font-bold text-emerald-600">{generalDonationStats.typicalRange}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {generalDonationStats.typicalRangeCount} donations in this range
                      </p>
                    </div>

                    {/* Donation Ranges Chart */}
                    {donationRanges.length > 0 && (
                      <div>
                        <p className="font-semibold text-sm mb-3">Donation Distribution by Range</p>
                        <ResponsiveContainer width="100%" height={250}>
                          <RechartsBarChart data={donationRanges}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis 
                              dataKey="label" 
                              tick={{ fontSize: 11 }}
                              angle={-15}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis 
                              tick={{ fontSize: 11 }}
                              allowDecimals={false}
                              label={{ value: 'Number of Donations', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                            />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                              labelStyle={{ color: '#f3f4f6' }}
                              itemStyle={{ color: '#10b981' }}
                              formatter={(value: any) => [`${value} donations`, 'Count']}
                            />
                            <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]}>
                              {donationRanges.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(${160 - index * 10}, 70%, ${45 + index * 5}%)`} />
                              ))}
                            </Bar>
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar (1 col) */}
          <div className="space-y-6">
            {/* Top Donors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Top Donors
                </CardTitle>
                <CardDescription>Highest contributors this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDonors.length > 0 ? (
                    topDonors.map((donor, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{donor.name}</p>
                            <p className="text-xs text-muted-foreground">{donor.count} donations</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">₱{donor.total.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No donor data available yet
                    </p>
                  )}
                  {topDonors.length > 0 && (
                    <Button variant="outline" className="w-full mt-2">
                      View All Donors
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Most Funded Campaigns
                </CardTitle>
                <CardDescription>Best performing campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCampaigns.length > 0 ? (
                    topCampaigns.map((campaign, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1">{campaign.title}</p>
                            <p className="text-xs text-muted-foreground">{campaign.count} donations</p>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            ₱{(campaign.total / 1000).toFixed(0)}k
                          </Badge>
                        </div>
                        {index < topCampaigns.length - 1 && <Separator />}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No campaign data available yet
                    </p>
                  )}
                  {topCampaigns.length > 0 && (
                    <Button variant="outline" className="w-full mt-2">
                      View All Campaigns
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Export & Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Generate Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Monthly Report (PDF)
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Donation Data (CSV)
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('xlsx')}>
                  <Download className="h-4 w-4 mr-2" />
                  Financial Report (XLSX)
                </Button>
                <Separator className="my-3" />
                <Button variant="default" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Transparency Report
                </Button>
              </CardContent>
            </Card>

            {/* Audit Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  Audit & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Verified Donations</span>
                  <Badge variant="secondary">{stats.totalCount}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reports Generated</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <Separator />
                <Button variant="outline" size="sm" className="w-full">
                  Send to Admin
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
        </TabsContent>

        {/* Campaign Analytics Tab */}
        <TabsContent value="campaigns" role="tabpanel" className="mt-0">
          <div className="container mx-auto px-4 lg:px-8 pt-6 pb-12 space-y-6">
            {/* Key Insight Banner */}
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">Key Insight: </span>
                    <span className="text-sm text-muted-foreground">{generateInsight()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overview Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="relative overflow-hidden bg-background/40 border-border/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 cursor-pointer rounded-2xl ring-1 ring-blue-500/30 hover:ring-2 active:scale-[0.98]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-transparent" />
        <CardContent className="relative p-5 h-24 lg:h-28 flex items-center justify-between">
          <div>
            <p className="text-xl lg:text-2xl font-extrabold text-blue-400">
              {summaryMetrics?.campaign_count ?? campaignTypes.reduce((sum, t) => sum + t.count, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Campaigns</p>
          </div>
          <div className="shrink-0">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
              <Target className="h-5 w-5 lg:h-6 lg:w-6 text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-background/40 border-border/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 cursor-pointer rounded-2xl ring-1 ring-sky-500/30 hover:ring-2 active:scale-[0.98]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/20 via-sky-400/10 to-transparent" />
        <CardContent className="relative p-5 h-24 lg:h-28 flex items-center justify-between">
          <div>
            <p className="text-xl lg:text-2xl font-extrabold text-sky-400">
              {summaryMetrics?.verified_donations ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Verified Donations</p>
          </div>
          <div className="shrink-0">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-sky-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-background/40 border-border/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 cursor-pointer rounded-2xl ring-1 ring-emerald-500/30 hover:ring-2 active:scale-[0.98]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-transparent" />
        <CardContent className="relative p-5 h-24 lg:h-28 flex items-center justify-between">
          <div>
            <p className="text-xl lg:text-2xl font-extrabold text-emerald-400">
              ₱{summaryMetrics?.total_raised?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Raised</p>
          </div>
          <div className="shrink-0">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
              <svg className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-background/40 border-border/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 cursor-pointer rounded-2xl ring-1 ring-indigo-500/30 hover:ring-2 active:scale-[0.98]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-indigo-400/10 to-transparent" />
        <CardContent className="relative p-5 h-24 lg:h-28 flex items-center justify-between">
          <div>
            <p className="text-xl lg:text-2xl font-extrabold text-indigo-400">
              ₱{summaryMetrics?.avg_donation?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avg Donation</p>
          </div>
          <div className="shrink-0">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
              <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-background/40 border-border/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 cursor-pointer rounded-2xl ring-1 ring-fuchsia-500/30 hover:ring-2 active:scale-[0.98]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 via-fuchsia-400/10 to-transparent" />
        <CardContent className="relative p-5 h-24 lg:h-28 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xl lg:text-2xl font-extrabold text-fuchsia-400">
                {summaryMetrics?.avg_goal_achievement?.toFixed(0) || '0'}%
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="pointer-events-auto p-1 hover:bg-white/10 rounded-full transition-colors">
                    <Info className="h-4 w-4 text-fuchsia-400" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Average Goal Achievement - Detailed Computation</DialogTitle>
                    <DialogDescription>
                      How we calculate the average goal achievement percentage
                    </DialogDescription>
                  </DialogHeader>
                  {goalComputationDetails && (
                    <div className="space-y-4">
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <p className="font-semibold text-sm mb-2">Formula:</p>
                        <p className="text-sm text-muted-foreground">{goalComputationDetails.formula}</p>
                        <div className="mt-3 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Campaigns</p>
                            <p className="text-lg font-bold">{goalComputationDetails.totalCampaigns}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Sum of Percentages</p>
                            <p className="text-lg font-bold">{goalComputationDetails.sumOfPercentages}%</p>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-background rounded">
                          <p className="text-sm font-semibold">Calculation:</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {goalComputationDetails.sumOfPercentages}% ÷ {goalComputationDetails.totalCampaigns} = {goalComputationDetails.averagePercentage}%
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-semibold text-sm mb-3">Campaign Breakdown:</p>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {goalComputationDetails.campaigns.map((camp: any, idx: number) => (
                            <div key={idx} className="p-3 bg-muted/50 rounded-lg text-sm">
                              <p className="font-medium mb-2">{camp.title}</p>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Goal</p>
                                  <p className="font-semibold">₱{camp.goal.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Raised</p>
                                  <p className="font-semibold">₱{camp.raised.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Achievement</p>
                                  <p className="font-semibold text-fuchsia-600">{camp.percentage}%</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Avg Goal %</p>
          </div>
          <div className="shrink-0">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
              <Percent className="h-5 w-5 lg:h-6 lg:w-6 text-fuchsia-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Campaign Analytics Tabs */}
    <Tabs defaultValue="overview" className="w-full">
      <div className="w-full mb-4">
        <TabsList className="!block !bg-transparent !p-0 !rounded-none !justify-start w-full overflow-x-auto whitespace-nowrap px-2 [-ms-overflow-style:none] [scrollbar-width:none]" role="tablist">
          <div className="inline-flex min-w-max items-center gap-2 sm:gap-4">
            <TabsTrigger value="overview" role="tab" className="rounded-lg px-4 sm:px-5 py-2 text-sm sm:text-base text-muted-foreground hover:bg-white/10 transition-colors data-[state=active]:bg-white/15 data-[state=active]:text-foreground shrink-0">Campaign Overview</TabsTrigger>
            <TabsTrigger value="type-insights" role="tab" className="rounded-lg px-4 sm:px-5 py-2 text-sm sm:text-base text-muted-foreground hover:bg-white/10 transition-colors data-[state=active]:bg-white/15 data-[state=active]:text-foreground shrink-0">Type Analysis</TabsTrigger>
            <TabsTrigger value="distribution" role="tab" className="rounded-lg px-4 sm:px-5 py-2 text-sm sm:text-base text-muted-foreground hover:bg-white/10 transition-colors data-[state=active]:bg-white/15 data-[state=active]:text-foreground shrink-0">Geographic Insights</TabsTrigger>
            <TabsTrigger value="trends" role="tab" className="rounded-lg px-4 sm:px-5 py-2 text-sm sm:text-base text-muted-foreground hover:bg-white/10 transition-colors data-[state=active]:bg-white/15 data-[state=active]:text-foreground shrink-0">Trends & Timing</TabsTrigger>
            <TabsTrigger value="completed" role="tab" className="rounded-lg px-4 sm:px-5 py-2 text-sm sm:text-base text-muted-foreground hover:bg-white/10 transition-colors data-[state=active]:bg-white/15 data-[state=active]:text-foreground shrink-0">Completed Campaigns</TabsTrigger>
          </div>
        </TabsList>
      </div>

      <TabsContent value="overview" role="tabpanel" className="mt-6">
        <OverviewTab
          campaignTypes={campaignTypes}
          overviewData={overviewData}
          beneficiaryData={beneficiaryData}
          temporalTrends={temporalTrends}
        />
      </TabsContent>

      <TabsContent value="type-insights" role="tabpanel" className="mt-6">
        <CampaignTypeInsights />
      </TabsContent>

      <TabsContent value="distribution" role="tabpanel" className="mt-6">
        <GeographicInsightsTab
          locationData={locationData}
          locationSummary={locationSummary}
        />
      </TabsContent>

      <TabsContent value="trends" role="tabpanel" className="mt-6">
        <TrendsAndTimingTab />
      </TabsContent>

      <TabsContent value="completed" role="tabpanel" className="mt-6">
        <CompletedCampaignsAnalytics />
      </TabsContent>
    </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
