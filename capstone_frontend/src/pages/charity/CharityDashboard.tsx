import { useEffect, useState } from "react";
import { 
  Megaphone, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  Plus,
  Heart,
  MessageCircle,
  Calendar,
  ArrowRight,
  BarChart3,
  Target
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authService } from "@/services/auth";
import { charityService } from "@/services/charity";
import { toast } from "sonner";
import { getCharityCoverUrl } from "@/lib/storage";

export default function CharityDashboard() {
  const navigate = useNavigate();
  const [charityData, setCharityData] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending'|'approved'|'rejected'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonationsMonth: 0,
    totalDonationsAllTime: 0,
    activeCampaigns: 0,
    donorsThisMonth: 0,
    pendingConfirmations: 0,
    newInteractions: 0
  });

  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [recentUpdate, setRecentUpdate] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
    loadAnalyticsData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        navigate('/auth/login');
        return;
      }

      // Get charity data
      const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      
      if (!res.ok) {
        toast.error('Failed to load charity data');
        return;
      }

      const me = await res.json();
      const charity = me?.charity;
      
      if (!charity) {
        toast.error('No charity found for this account');
        return;
      }

      setCharityData(charity);
      const status = charity.verification_status as 'pending'|'approved'|'rejected' | undefined;
      if (status) setVerificationStatus(status);

      // Load dashboard stats in parallel
      await Promise.all([
        loadStats(charity.id),
        loadRecentDonations(charity.id),
        loadRecentPosts(charity.id)
      ]);

    } catch (error: any) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async (charityId: number) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      // Get donations data
      const donationsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/charities/${charityId}/donations`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );

      if (donationsRes.ok) {
        const donations = await donationsRes.json();
        const allDonations = donations.data || donations;

        // Calculate stats
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthDonations = allDonations.filter((d: any) => {
          const donationDate = new Date(d.created_at);
          return donationDate.getMonth() === currentMonth && 
                 donationDate.getFullYear() === currentYear &&
                 d.status === 'completed';
        });

        const confirmedDonations = allDonations.filter((d: any) => d.status === 'completed');
        const pendingDonations = allDonations.filter((d: any) => d.status === 'pending');

        const totalMonth = thisMonthDonations.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
        const totalAllTime = confirmedDonations.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);

        // Get unique donors this month
        const uniqueDonors = new Set(thisMonthDonations.map((d: any) => d.donor_id || d.donor_name));

        setStats(prev => ({
          ...prev,
          totalDonationsMonth: totalMonth,
          totalDonationsAllTime: totalAllTime,
          donorsThisMonth: uniqueDonors.size,
          pendingConfirmations: pendingDonations.length
        }));
      }

      // Get campaigns data
      const campaignsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/charities/${charityId}/campaigns`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );

      if (campaignsRes.ok) {
        const campaigns = await campaignsRes.json();
        const campaignList = campaigns.data || campaigns;
        const activeCampaigns = campaignList.filter((c: any) => c.status === 'published');
        
        setStats(prev => ({
          ...prev,
          activeCampaigns: activeCampaigns.length
        }));
      }

      // Get updates data for interactions count
      const updatesRes = await fetch(
        `${import.meta.env.VITE_API_URL}/charities/${charityId}/updates`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );

      if (updatesRes.ok) {
        const updates = await updatesRes.json();
        const updateList = updates.data || updates;
        
        // Calculate new interactions (likes + comments from recent updates)
        const recentUpdates = updateList.slice(0, 5);
        const interactions = recentUpdates.reduce((sum: number, update: any) => {
          return sum + (update.likes_count || 0) + (update.comments_count || 0);
        }, 0);

        setStats(prev => ({
          ...prev,
          newInteractions: interactions
        }));
      }

    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      // Get charity ID from user
      const userRes = await fetch(
        `${import.meta.env.VITE_API_URL}/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let charityId = null;
      if (userRes.ok) {
        const userData = await userRes.json();
        charityId = userData.charity?.id;
      }

      // Don't proceed if we don't have a charity ID
      if (!charityId) {
        console.warn('No charity ID found');
        return;
      }

      // Get campaign types
      const typesRes = await fetch(
        `${import.meta.env.VITE_API_URL}/analytics/campaigns/types`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let types = [];
      let topType = null;
      if (typesRes.ok) {
        const typesData = await typesRes.json();
        types = typesData.data || [];
        topType = types[0];
      }

      // Get trending campaigns (top performing)
      const trendingRes = await fetch(
        `${import.meta.env.VITE_API_URL}/analytics/campaigns/trending?days=7&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let topCampaign = null;
      let trendingCampaigns = [];
      if (trendingRes.ok) {
        const trendingData = await trendingRes.json();
        trendingCampaigns = trendingData.data || [];
        topCampaign = trendingCampaigns[0];
      }

      // Calculate recent donations summary from recentDonations
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Get all donations for this charity
      const donationsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/charities/${charityId}/donations`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );

      let donationsThisWeek = 0;
      let donationsThisMonth = 0;
      let donationsLastMonth = 0;
      let uniqueDonorsThisMonth = new Set();
      let returningDonors = 0;

      if (donationsRes.ok) {
        const donationsData = await donationsRes.json();
        const allDonations = donationsData.data || donationsData || [];
        const completedDonations = allDonations.filter((d: any) => d.status === 'completed');

        completedDonations.forEach((d: any) => {
          const donationDate = new Date(d.created_at);
          const amount = parseFloat(d.amount || 0);

          if (donationDate >= oneWeekAgo) {
            donationsThisWeek += amount;
          }
          if (donationDate >= oneMonthAgo) {
            donationsThisMonth += amount;
            if (d.donor_id) uniqueDonorsThisMonth.add(d.donor_id);
          }
          if (donationDate >= twoMonthsAgo && donationDate < oneMonthAgo) {
            donationsLastMonth += amount;
          }
        });

        // Calculate returning donors
        const donorCounts = new Map();
        completedDonations.forEach((d: any) => {
          if (d.donor_id) {
            donorCounts.set(d.donor_id, (donorCounts.get(d.donor_id) || 0) + 1);
          }
        });
        returningDonors = Array.from(donorCounts.values()).filter(count => count > 1).length;
      }

      // Calculate trend
      const trend = donationsLastMonth > 0 
        ? ((donationsThisMonth - donationsLastMonth) / donationsLastMonth * 100).toFixed(1)
        : "100.0";

      // Generate key insight
      let keyInsight = "Keep engaging with your donors to maintain momentum.";
      if (parseFloat(trend) > 10) {
        keyInsight = `Great work! Donations increased by ${trend}% this month. Your campaigns are gaining traction.`;
      } else if (parseFloat(trend) < -10) {
        keyInsight = `Donations decreased by ${Math.abs(parseFloat(trend))}% this month. Consider launching new campaigns or updates.`;
      } else if (topCampaign && topCampaign.donation_count > 5) {
        keyInsight = `"${topCampaign.title}" is trending with ${topCampaign.donation_count} donations this week!`;
      }

      setAnalyticsData({
        topType,
        topCampaign,
        totalTypes: types.length,
        donationsThisWeek,
        donationsThisMonth,
        trend: parseFloat(trend),
        uniqueDonors: uniqueDonorsThisMonth.size,
        returningDonors,
        newDonors: uniqueDonorsThisMonth.size - returningDonors,
        keyInsight,
        trendingType: types[0] // Most common type is already trending
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadRecentDonations = async (charityId: number) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/charities/${charityId}/donations`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );

      if (res.ok) {
        const data = await res.json();
        const donations = data.data || data;
        
        // Get completed donations, sorted by date
        const completed = donations
          .filter((d: any) => d.status === 'completed')
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 4)
          .map((d: any) => ({
            donor: d.donor_name || 'Anonymous',
            amount: parseFloat(d.amount || 0),
            campaign: d.campaign?.title || 'General Fund',
            date: formatTimeAgo(d.created_at)
          }));

        setRecentDonations(completed);
      }
    } catch (error) {
      console.error('Failed to load recent donations:', error);
    }
  };

  const loadRecentPosts = async (charityId: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        console.log('No token available for loading updates');
        return;
      }

      console.log('Fetching updates for charity:', charityId);
      // Fetch from updates endpoint (the actual charity updates/posts)
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/charities/${charityId}/updates`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );

      console.log('Updates response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('Updates data received:', data);
        const updates = data.data || data;
        
        if (Array.isArray(updates) && updates.length > 0) {
          const latest = updates[0];
          console.log('Latest update:', latest);
          setRecentUpdate({
            title: 'Recent Update',
            snippet: latest.content ? latest.content.substring(0, 150) + (latest.content.length > 150 ? '...' : '') : 'No content',
            likes: latest.likes_count || 0,
            comments: latest.comments_count || 0,
            date: formatTimeAgo(latest.created_at)
          });
        } else {
          console.log('No updates found');
          setRecentUpdate(null);
        }
      } else {
        const errorText = await res.text();
        console.error('Failed to load updates:', res.status, errorText);
        setRecentUpdate(null);
      }
    } catch (error) {
      console.error('Failed to load recent updates:', error);
      setRecentUpdate(null);
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

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3 py-1 text-sm font-semibold shadow-sm">
            <CheckCircle className="h-4 w-4" />
            VERIFIED
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-500/30 flex items-center gap-1 px-3 py-1 text-sm font-semibold">
            <AlertCircle className="h-4 w-4" />
            PENDING REVIEW
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 px-3 py-1 text-sm font-semibold shadow-sm">
            <XCircle className="h-4 w-4" />
            ACTION REQUIRED
          </Badge>
        );
      default:
        return <Badge className="px-3 py-1">{status}</Badge>;
    }
  };

  const coverImageUrl = getCharityCoverUrl(charityData?.cover_image);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Cover Photo Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {coverImageUrl ? (
          <img 
            src={coverImageUrl} 
            alt="Charity Cover" 
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
        )}
      </div>

      {/* Header Section Below Cover */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <Card className="border-2 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {charityData?.name || 'Your Charity Name'}
                </h1>
                <p className="text-base text-muted-foreground max-w-3xl">
                  {charityData?.mission || 'Empowering communities through sustainable programs and transparent fundraising.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getVerificationBadge(verificationStatus)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* 1. Actionable Alerts & To-Do Card */}
        <Card className="border-2 border-primary/30 shadow-xl bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-primary animate-pulse" />
              Action Required
            </CardTitle>
            <CardDescription>Important tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {/* Pending Donations */}
            <button
              onClick={() => navigate('/charity/donations')}
              className="flex flex-col items-start p-5 rounded-xl border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 hover:border-orange-500 hover:shadow-xl md:hover:scale-105 transition-all duration-300 text-left group"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/30 to-amber-500/30 shadow-md">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-500 mb-1">
                {stats.pendingConfirmations}
              </div>
              <div className="text-sm font-semibold text-foreground">Donations Pending</div>
              <div className="text-xs text-muted-foreground mt-1">Click to review and confirm</div>
            </button>

            {/* Verification Status */}
            <div className="flex flex-col items-start p-5 rounded-xl border-2 border-border/50 bg-muted/30">
              <div className="flex items-center justify-between w-full mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mb-2">
                {getVerificationBadge(verificationStatus)}
              </div>
              <div className="text-sm font-semibold text-foreground">Verification Status</div>
              <div className="text-xs text-muted-foreground mt-1">
                {verificationStatus === 'approved' && 'Your charity is verified'}
                {verificationStatus === 'pending' && 'Under admin review'}
                {verificationStatus === 'rejected' && 'Please update documents'}
              </div>
            </div>

            {/* New Interactions */}
            <button
              onClick={() => navigate('/charity/updates')}
              className="flex flex-col items-start p-5 rounded-xl border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 hover:border-blue-500 hover:shadow-xl md:hover:scale-105 transition-all duration-300 text-left group"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 shadow-md">
                  <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-500 mb-1">
                {stats.newInteractions}
              </div>
              <div className="text-sm font-semibold text-foreground">New Interactions</div>
              <div className="text-xs text-muted-foreground mt-1">Comments & likes on posts</div>
            </button>
          </CardContent>
        </Card>

        {/* 2. Key Statistics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-500/30 shadow-lg">
                  <svg className="h-6 w-6 text-emerald-700 dark:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">This Month</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₱{stats.totalDonationsMonth.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Total donations received
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <TrendingUp className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">All Time</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₱{stats.totalDonationsAllTime.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Grand total raised
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                  <Megaphone className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Campaigns</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.activeCampaigns}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Currently running
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                  <Users className="h-6 w-6 text-violet-700 dark:text-violet-300" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Donors This Month</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.donorsThisMonth}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Unique supporters
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Analytics Insights - Enhanced */}
        {analyticsData && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl leading-8 font-bold flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <span className="truncate">Analytics Insights</span>
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">Real-time performance metrics and trends</p>
              </div>
              <Button onClick={() => navigate('/charity/reports')} className="h-10 w-full sm:w-auto rounded-lg shadow-lg">
                View Detailed Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Key Insight Banner */}
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/30 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20 mt-0.5">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Key Insight</h3>
                    <p className="text-muted-foreground">{analyticsData.keyInsight}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Top-Performing Campaign */}
              {analyticsData.topCampaign && (
                <Card className="group hover:shadow-xl md:hover:scale-[1.02] transition-all duration-300 border-border/50 hover:border-amber-500/50 cursor-pointer bg-card/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-colors">
                        <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20 border">
                        Top
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Performing</p>
                      <h3 className="font-bold text-lg line-clamp-2 text-foreground min-h-[3.5rem]">
                        {analyticsData.topCampaign.title}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                          {analyticsData.topCampaign.progress?.toFixed(0) || 0}%
                        </span>
                        <span className="text-xs text-muted-foreground">of goal</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData.topCampaign.donation_count} donations this week
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Donations Summary */}
              <Card className="group hover:shadow-xl md:hover:scale-[1.02] transition-all duration-300 border-border/50 hover:border-green-500/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-colors">
                      <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        analyticsData.trend > 0 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : analyticsData.trend < 0
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      }`}
                    >
                      {analyticsData.trend > 0 ? '+' : ''}{analyticsData.trend.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">This Month</p>
                    <h3 className="text-2xl font-bold text-foreground">
                      ₱{analyticsData.donationsThisMonth.toLocaleString()}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      ₱{analyticsData.donationsThisWeek.toLocaleString()} this week
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {analyticsData.trend > 0 ? '↑' : analyticsData.trend < 0 ? '↓' : '→'} vs last month
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Donor Engagement */}
              <Card className="group hover:shadow-xl md:hover:scale-[1.02] transition-all duration-300 border-border/50 hover:border-blue-500/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-colors">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20 border">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Donor Engagement</p>
                    <h3 className="text-2xl font-bold text-foreground">
                      {analyticsData.uniqueDonors}
                    </h3>
                    <p className="text-xs text-muted-foreground">unique donors this month</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Returning</p>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-500">{analyticsData.returningDonors}</p>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">New</p>
                        <p className="text-sm font-bold text-cyan-600 dark:text-cyan-500">{analyticsData.newDonors}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Campaign Type */}
              {analyticsData.trendingType && (
                <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-border/50 hover:border-purple-500/50 bg-card/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
                        <Megaphone className="h-6 w-6 text-purple-500" />
                      </div>
                      <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20 border">
                        Trending
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Most Active Type</p>
                      <h3 className="text-xl font-bold text-foreground capitalize">
                        {analyticsData.trendingType.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData.trendingType.count} active campaign{analyticsData.trendingType.count !== 1 ? 's' : ''}
                      </p>
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">Focus on this category for better engagement</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* 4. Quick Actions Card */}
        <Card className="border-2 border-indigo-200 dark:border-indigo-800 shadow-xl bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/30 dark:to-blue-950/30">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              Quick Actions
            </CardTitle>
            <CardDescription>Manage your charity operations efficiently</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Button 
              size="lg" 
              onClick={() => navigate('/charity/updates')} 
              className="h-auto py-4 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="mr-2 h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">Create Update</span>
                <span className="text-xs opacity-90">Share news with donors</span>
              </div>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/charity/campaigns')} 
              className="h-auto py-4 border-2 hover:bg-accent hover:scale-105 transition-all duration-300"
            >
              <Plus className="mr-2 h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">New Campaign</span>
                <span className="text-xs text-muted-foreground">Start fundraising</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* 5. Recent Activity Feed */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Donations */}
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 shadow-xl bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent Donations
                  </CardTitle>
                  <CardDescription>Latest contributions from your supporters</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/charity/donations')} className="hover:bg-primary/10">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentDonations.length > 0 ? (
                <ScrollArea className="h-[280px] pr-4">
                  <div className="space-y-3">
                    {recentDonations.map((donation, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-xl border-2 border-border/50 bg-card/80 hover:border-primary/50 hover:bg-card hover:shadow-md transition-all duration-300">
                        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500/30 to-green-500/30 flex items-center justify-center">
                          <svg className="h-6 w-6 text-emerald-700 dark:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            <span className="font-bold">{donation.donor}</span> donated{' '}
                            <span className="text-emerald-700 dark:text-emerald-300 font-bold">₱{donation.amount.toLocaleString()}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            to {donation.campaign}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="inline h-3 w-3" />
                            {donation.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="h-[280px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">No donations yet</h4>
                    <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                      Confirmed donations will appear here
                    </p>
                    <Button variant="outline" onClick={() => navigate('/charity/donations')} className="hover:bg-primary/10">
                      View All Donations
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Updates */}
          <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                    Recent Updates
                  </CardTitle>
                  <CardDescription>Your latest post activity</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/charity/updates')} className="hover:bg-primary/10">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUpdate ? (
                  <div className="p-5 rounded-xl border-2 border-border/50 bg-card/80 hover:border-primary/50 hover:bg-card hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => navigate('/charity/updates')}>
                    <h4 className="font-bold text-foreground mb-2">{recentUpdate.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {recentUpdate.snippet}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
                        <Heart className="h-4 w-4 fill-current" />
                        <span className="font-medium">{recentUpdate.likes}</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500">
                        <MessageCircle className="h-4 w-4" />
                        <span className="font-medium">{recentUpdate.comments}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-auto text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs">{recentUpdate.date}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-xl border-2 border-dashed border-border/50 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <Megaphone className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">No updates yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven't posted any updates
                    </p>
                  </div>
                )}

                {/* Call to Action */}
                <div className="p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-center hover:bg-primary/10 transition-colors">
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                    <Megaphone className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">Share Your Impact</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Keep your donors engaged by posting regular updates about your work
                  </p>
                  <Button onClick={() => navigate('/charity/updates')} className="shadow-lg hover:shadow-xl transition-all">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
