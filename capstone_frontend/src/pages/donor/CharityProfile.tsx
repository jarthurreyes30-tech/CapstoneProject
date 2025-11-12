import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Loader2, Flag, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { buildApiUrl, buildStorageUrl } from "@/lib/api";
import { ProfileHeader } from "@/components/charity/ProfileHeader";
import { ProfileStats } from "@/components/charity/ProfileStats";
import { ProfileTabs } from "@/components/charity/ProfileTabs";
import { ProfileSidebar } from "@/components/charity/ProfileSidebar";
import { UpdatesSidebar } from "@/components/charity/UpdatesSidebar";
import { CampaignsSidebar } from "@/components/charity/CampaignsSidebar";
import { SaveButton } from "@/components/SaveButton";
import { ReportDialog } from "@/components/dialogs/ReportDialog";

interface CharityData {
  id: number;
  name: string;
  acronym?: string;
  mission?: string;
  vision?: string;
  description?: string;
  tagline?: string;
  logo_path?: string;
  cover_image?: string;
  banner_path?: string;
  email?: string;
  contact_email?: string;
  primary_email?: string;
  phone?: string;
  contact_phone?: string;
  primary_phone?: string;
  address?: string;
  full_address?: string;
  region?: string;
  municipality?: string;
  province?: string;
  website?: string;
  website_url?: string;
  operating_hours?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
  verification_status?: string;
  is_verified?: boolean;
  created_at?: string;
  total_received?: number;
}

interface Stats {
  total_followers?: number;
  followers_count?: number;
  total_donations?: number;
  total_received?: number;
  total_campaigns?: number;
  active_campaigns?: number;
  total_updates?: number;
  updates_count?: number;
  total_donors?: number;
}

interface Update {
  id: number;
  charity_id: number;
  title?: string;
  content: string;
  media_urls: string[];
  is_pinned: boolean;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  charity?: {
    id: number;
    name: string;
    logo_path?: string;
  };
  children?: Update[];
}


interface Campaign {
  id: number;
  title: string;
  description?: string;
  target_amount?: number;
  goal_amount?: number;
  current_amount?: number;
  raised_amount?: number;
  deadline_at?: string;
  end_date?: string;
  status: string;
  cover_image_path?: string;
  image_path?: string;
  banner_image?: string;
  donors_count?: number;
}

export default function CharityProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [charity, setCharity] = useState<CharityData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadCharityProfile();
      loadCharityUpdates();
      loadCharityCampaigns();
      checkFollowStatus();
    }
  }, [id]);

  const loadCharityProfile = async () => {
    try {
      const response = await fetch(buildApiUrl(`/charities/${id}`));
      if (response.ok) {
        const data = await response.json();
        const charityInfo = data.data || data;
        setCharity(charityInfo);
        
        // Set stats from charity data
        setStats({
          total_received: charityInfo.total_received || 0,
          followers_count: charityInfo.followers_count || 0,
          total_campaigns: charityInfo.total_campaigns || 0,
          total_updates: charityInfo.total_updates || 0,
        });
      }
    } catch (error) {
      console.error('Error loading charity profile:', error);
      toast.error('Failed to load charity profile');
    } finally {
      setLoading(false);
    }
  };

  const loadCharityUpdates = async () => {
    try {
      const response = await fetch(buildApiUrl(`/charities/${id}/updates`));
      if (response.ok) {
        const data = await response.json();
        const updatesArray = data.data || data || [];
        console.log('Updates received:', updatesArray);
        // Filter out any null/undefined items
        const validUpdates = Array.isArray(updatesArray) ? updatesArray.filter(u => u && u.id) : [];
        setUpdates(validUpdates);
      }
    } catch (error) {
      console.error('Error loading charity updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCharityCampaigns = async () => {
    try {
      const response = await fetch(buildApiUrl(`/charities/${id}/campaigns`));
      if (response.ok) {
        const data = await response.json();
        const campaignsArray = data.data || data || [];
        console.log('Campaigns received:', campaignsArray);
        // Filter out any null/undefined items
        const validCampaigns = Array.isArray(campaignsArray) ? campaignsArray.filter(c => c && c.id) : [];
        setCampaigns(validCampaigns);
      }
    } catch (error) {
      console.error('Error loading charity campaigns:', error);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      
      const response = await fetch(buildApiUrl(`/charities/${id}/follow-status`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.is_following);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        toast.error('Please login to follow charities');
        return;
      }

      const response = await fetch(buildApiUrl(`/charities/${id}/follow`), {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Follow toggle error:', response.status, errorText);
        throw new Error(`Failed to update follow status (${response.status})`);
      }

      const data = await response.json();
      setIsFollowing(data.is_following);
      toast.success(data.message);
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update follow status');
    }
  };

  // Update interaction handlers
  const handleLike = async (updateId: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        toast.error('Please login to like updates');
        return;
      }

      // Optimistic update
      setUpdates(prevUpdates =>
        prevUpdates.map(update =>
          update.id === updateId
            ? {
                ...update,
                is_liked: !update.is_liked,
                likes_count: update.is_liked ? update.likes_count - 1 : update.likes_count + 1
              }
            : update
        )
      );

      const response = await fetch(buildApiUrl(`/updates/${updateId}/like`), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        // Revert on error
        setUpdates(prevUpdates =>
          prevUpdates.map(update =>
            update.id === updateId
              ? {
                  ...update,
                  is_liked: !update.is_liked,
                  likes_count: update.is_liked ? update.likes_count + 1 : update.likes_count - 1
                }
              : update
          )
        );
        throw new Error('Failed to like update');
      }
    } catch (error) {
      console.error('Error liking update:', error);
    }
  };

  const handleShare = async (updateId: number, platform: string) => {
    try {
      const token = authService.getToken();
      if (!token) {
        toast.error('Please login to share updates');
        return;
      }

      const response = await fetch(buildApiUrl(`/updates/${updateId}/share`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ platform })
      });

      if (response.ok) {
        setUpdates(prevUpdates =>
          prevUpdates.map(update =>
            update.id === updateId
              ? { ...update, shares_count: (update.shares_count || 0) + 1 }
              : update
          )
        );
        toast.success(`Shared to ${platform}`);
      }
    } catch (error) {
      console.error('Error sharing update:', error);
      toast.error('Failed to share update');
    }
  };

  const handleFetchComments = async (updateId: number): Promise<Comment[]> => {
    try {
      const token = authService.getToken();
      const response = await fetch(buildApiUrl(`/updates/${updateId}/comments`), {
        headers: {
          Accept: 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const handleAddComment = async (updateId: number, content: string) => {
    try {
      const token = authService.getToken();
      if (!token) {
        toast.error('Please login to comment');
        return;
      }

      const response = await fetch(buildApiUrl(`/updates/${updateId}/comments`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        setUpdates(prevUpdates =>
          prevUpdates.map(update =>
            update.id === updateId
              ? { ...update, comments_count: update.comments_count + 1 }
              : update
          )
        );
        toast.success('Comment added');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: number, updateId: number) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await fetch(buildApiUrl(`/comments/${commentId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setUpdates(prevUpdates =>
          prevUpdates.map(update =>
            update.id === updateId
              ? { ...update, comments_count: Math.max(0, update.comments_count - 1) }
              : update
          )
        );
        toast.success('Comment deleted');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading charity profile...</p>
        </div>
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground mb-2">Charity Not Found</h1>
          <p className="text-muted-foreground">The charity you're looking for doesn't exist or isn't available.</p>
          <Button className="mt-4" onClick={() => navigate('/donor/charities')}>
            Back to Charities
          </Button>
        </div>
      </div>
    );
  }

  // Helper functions
  const logoUrl = charity?.logo_path ? buildStorageUrl(charity.logo_path) : null;
  const coverUrl = charity?.cover_image || charity?.banner_path ? buildStorageUrl(charity.cover_image || charity.banner_path!) : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: charity?.name,
        text: `Check out ${charity?.name} on CharityHub`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Profile link copied to clipboard');
    }
  };

  // Transform campaigns to match component expectations
  const transformedCampaigns = campaigns.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    goal: c.goal_amount || c.target_amount || 0,
    amountRaised: c.current_amount || c.raised_amount || 0,
    donorsCount: c.donors_count || 0,
    status: c.status,
    deadline: c.end_date || c.deadline_at,
    bannerImage: c.banner_image || c.cover_image_path || c.image_path,
  }));

  // Calculate campaign stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalRaisedCampaigns = campaigns.reduce((sum, c) => sum + (c.current_amount || c.raised_amount || 0), 0);
  const avgCompletion = totalCampaigns > 0
    ? campaigns.reduce((sum, c) => {
        const goal = c.goal_amount || c.target_amount || 1;
        const raised = c.current_amount || c.raised_amount || 0;
        return sum + (raised / goal) * 100;
      }, 0) / totalCampaigns
    : 0;
  const topCampaign = campaigns.sort((a, b) => 
    (b.current_amount || b.raised_amount || 0) - (a.current_amount || a.raised_amount || 0)
  )[0];

  const statsData = {
    totalRaised: stats?.total_received || 0,
    campaigns: stats?.total_campaigns || campaigns.length,
    followers: stats?.followers_count || 0,
    updates: stats?.total_updates || updates.length,
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-8">
      {/* Profile Header */}
      <ProfileHeader
        viewMode="donor"
        charity={charity!}
        logoUrl={logoUrl}
        coverUrl={coverUrl}
        onShare={handleShareProfile}
        onBack={() => navigate('/donor/charities')}
        backButtonText="Back to Charities"
        actionButtons={
          <>
            <Button 
              variant={isFollowing ? "default" : "outline"} 
              onClick={handleFollowToggle}
              className={`${
                isFollowing 
                  ? "bg-primary hover:bg-primary/90" 
                  : "hover:bg-primary/10"
              } shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150`}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
            <SaveButton 
              itemId={charity?.id || 0} 
              itemType="charity"
              variant="outline"
              size="default"
              className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
            />
            <Button 
              variant="outline" 
              onClick={() => setReportDialogOpen(true)}
              className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-600 dark:hover:bg-orange-950/20"
            >
              <Flag className="w-4 h-4 mr-2" />
              Report
            </Button>
          </>
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 pt-6">
        <ProfileStats 
          stats={statsData} 
          formatCurrency={formatCurrency}
          onTotalRaisedClick={() => setActiveTab('campaigns')}
          onCampaignsClick={() => setActiveTab('campaigns')}
          onFollowersClick={() => {}}
          onUpdatesClick={() => setActiveTab('updates')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <ProfileTabs
              viewMode="donor"
              charity={charity!}
              recentUpdates={updates}
              campaigns={transformedCampaigns}
              formatDate={formatDate}
              getTimeAgo={getTimeAgo}
              buildStorageUrl={buildStorageUrl}
              formatCurrency={formatCurrency}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onCampaignsRefresh={loadCharityCampaigns}
              onUpdatesRefresh={loadCharityUpdates}
              onProfileRefresh={loadCharityProfile}
            />
          </div>

          <div className="lg:col-span-4 lg:pt-14">
            {activeTab === 'updates' ? (
              <UpdatesSidebar
                totalLikes={updates.reduce((sum, u) => sum + (u.likes_count || 0), 0)}
                totalComments={updates.reduce((sum, u) => sum + (u.comments_count || 0), 0)}
                totalPosts={stats?.total_updates || updates.length || 0}
                recentUpdates={updates}
                canCreate={false}
              />
            ) : activeTab === 'campaigns' ? (
              <CampaignsSidebar
                viewMode="donor"
                totalCampaigns={totalCampaigns}
                activeCampaigns={activeCampaigns}
                totalRaised={totalRaisedCampaigns}
                avgCompletion={avgCompletion}
                topCampaign={topCampaign}
              />
            ) : (
              <ProfileSidebar viewMode="donor" charity={charity!} />
            )}
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      {charity && (
        <ReportDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          targetType="charity"
          targetId={charity.id}
          targetName={charity.name}
        />
      )}
    </div>
  );
}
