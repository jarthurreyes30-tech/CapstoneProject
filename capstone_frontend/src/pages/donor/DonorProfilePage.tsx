import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Share2, MoreVertical, MapPin, TrendingUp, Heart, Calendar, Users, Bookmark, Building2, FileText, Eye, Trash2, Coins, Flag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useDonorProfile, updateDonorProfile, updateDonorImage } from '@/hooks/useDonorProfile';
import { FollowedCharitiesModal } from '@/components/modals/FollowedCharitiesModal';
import api from '@/lib/axios';
import { useDonorActivity } from '@/hooks/useDonorActivity';
import { useDonorMilestones } from '@/hooks/useDonorMilestones';
import { MetricCard } from '@/components/donor/MetricCard';
import { MilestonesGrid } from '@/components/donor/MilestonesGrid';
import { ActivityList } from '@/components/donor/ActivityList';
import { DonorAbout } from '@/components/donor/DonorAbout';
import { getCharityLogoUrl } from '@/lib/storage';
import { ImageViewerModal } from '@/components/charity/ImageViewerModal';
import { ReportDialog } from '@/components/dialogs/ReportDialog';

export default function DonorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalType, setImageModalType] = useState<'profile' | 'cover'>('profile');
  const [showFollowedModal, setShowFollowedModal] = useState(false);
  const [followedCount, setFollowedCount] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<{
    campaigns: any[];
    charities: any[];
    posts: any[];
  }>({
    campaigns: [],
    charities: [],
    posts: []
  });
  const [savedLoading, setSavedLoading] = useState(false);
  
  // Use current user's ID if not specified
  const donorId = id || user?.id?.toString() || '';
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Fetch data
  const { profile, loading: profileLoading, refetch: refetchProfile } = useDonorProfile(donorId);
  
  // Debug: Log profile data when it changes
  useEffect(() => {
    if (profile) {
      console.log('=== DONOR PROFILE DATA ===');
      console.log('ID:', profile.id);
      console.log('Name:', profile.name);
      console.log('Email:', profile.email);
      console.log('Avatar URL:', profile.avatar_url);
      console.log('Cover URL:', profile.cover_url);
      console.log('Location:', profile.location);
      console.log('Total Donated:', profile.total_donated);
      console.log('Campaigns Supported:', profile.campaigns_supported_count);
      console.log('Recent Donations:', profile.recent_donations_count);
      console.log('Liked Campaigns:', profile.liked_campaigns_count);
      console.log('Full Profile Object:', profile);
      console.log('=== END DONOR PROFILE DATA ===');
    }
  }, [profile]);
  const { donations, loading: activityLoading, hasMore, loadMore } = useDonorActivity(donorId);
  const { milestones, loading: milestonesLoading } = useDonorMilestones(donorId);
  
  const isOwner = (!!profile?.is_owner) || (!!user?.id && Number(user.id) === profile?.id);
  
  // Fetch followed charities count
  const fetchFollowedCount = async () => {
    if (!isOwner) return;
    try {
      const response = await api.get('/me/following');
      const data = response.data;
      setFollowedCount(Array.isArray(data) ? data.length : 0);
    } catch (error: any) {
      // Silently fail - backend might not be ready
      console.error('Failed to fetch followed count', error);
      setFollowedCount(0);
    }
  };

  // Fetch saved items
  const fetchSavedItems = async () => {
    if (!isOwner) return;
    setSavedLoading(true);
    try {
      const response = await api.get('/me/saved');
      const data = response.data;
      if (data.grouped) {
        setSavedItems(data.grouped);
      } else if (Array.isArray(data)) {
        setSavedItems({
          campaigns: data,
          charities: [],
          posts: []
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch saved items', error);
      setSavedItems({ campaigns: [], charities: [], posts: [] });
    } finally {
      setSavedLoading(false);
    }
  };
  
  // Fetch on mount if owner
  useEffect(() => {
    if (isOwner && profile) {
      fetchFollowedCount();
      fetchSavedItems();
    }
  }, [isOwner, profile]);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    interests: '',
    gender: '',
    date_of_birth: '',
    street_address: '',
    city: '',
    province: '',
    region: '',
    postal_code: '',
  });

  const handleShare = () => {
    const url = `${window.location.origin}/donor/profile/${donorId}`;
    if (navigator.share) {
      navigator.share({
        title: profile?.name || 'Donor Profile',
        text: 'Check out this donor profile',
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Profile link copied to clipboard!');
    }
  };

  const openImageModal = (type: 'profile' | 'cover') => {
    setImageModalType(type);
    setImageModalOpen(true);
  };

  const handleImageUpdate = async (file: File, type: 'profile' | 'cover') => {
    if (!profile) return;
    const res = await updateDonorImage(profile.id, file, type);
    if (!res.success) throw new Error(res.error || 'Update failed');
    await refetchProfile();
  };

  const openEditDialog = () => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        interests: profile.interests || '',
        gender: profile.gender || '',
        date_of_birth: profile.date_of_birth || '',
        street_address: profile.street_address || '',
        city: profile.city || '',
        province: profile.province || '',
        region: profile.region || '',
        postal_code: profile.postal_code || '',
      });
    }
    setEditDialogOpen(true);
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    const result = await updateDonorProfile(profile.id, editForm);
    
    if (result.success) {
      toast.success('Profile updated successfully');
      setEditDialogOpen(false);
      refetchProfile();
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative bg-gradient-to-br from-orange-50/30 via-pink-50/20 to-blue-50/30 dark:from-orange-950/10 dark:via-pink-950/10 dark:to-blue-950/10">
          <div className="container mx-auto px-4 lg:px-8 pt-4">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="container mx-auto px-4 lg:px-8 pt-4 pb-16">
            <Skeleton className="h-[280px] lg:h-[340px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Donor not found</h2>
            <p className="text-muted-foreground mb-4">
              The donor profile you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsConfig = [
    {
      icon: TrendingUp,
      label: 'Total Donated',
      value: formatCurrency(profile.total_donated),
      gradient: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
      ring: 'ring-emerald-500/30',
      iconColor: 'text-emerald-400',
      valueColor: 'text-emerald-400',
    },
    {
      icon: Calendar,
      label: 'Campaigns Supported',
      value: profile.campaigns_supported_count.toString(),
      gradient: 'from-indigo-500/20 via-indigo-400/10 to-transparent',
      ring: 'ring-indigo-500/30',
      iconColor: 'text-indigo-400',
      valueColor: 'text-indigo-400',
    },
    {
      icon: Heart,
      label: 'Recent Donations',
      value: profile.recent_donations_count.toString(),
      gradient: 'from-sky-500/20 via-sky-400/10 to-transparent',
      ring: 'ring-sky-500/30',
      iconColor: 'text-sky-400',
      valueColor: 'text-sky-400',
    },
    {
      icon: Users,
      label: 'Followed Charities',
      value: isOwner ? followedCount.toString() : profile.liked_campaigns_count.toString(),
      gradient: 'from-pink-500/20 via-pink-400/10 to-transparent',
      ring: 'ring-pink-500/30',
      iconColor: 'text-pink-400',
      valueColor: 'text-pink-400',
      onClick: isOwner ? () => setShowFollowedModal(true) : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-8">
      {/* Profile Header - Matching Charity Profile */}
      <div className="relative bg-gradient-to-br from-orange-50/30 via-pink-50/20 to-blue-50/30 dark:from-orange-950/10 dark:via-pink-950/10 dark:to-blue-950/10">
        {/* Back Button */}
        <div className="container mx-auto px-4 lg:px-8 pt-4 hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Cover Photo */}
        <div className="container mx-auto px-4 lg:px-8 pt-4 pb-16">
          <div
            className={`relative h-[280px] lg:h-[340px] rounded-2xl overflow-hidden shadow-lg group ${isOwner ? 'cursor-pointer' : ''}`}
            onClick={() => isOwner && openImageModal('cover')}
            tabIndex={isOwner ? 0 : -1}
            onKeyDown={(e) => isOwner && e.key === 'Enter' && openImageModal('cover')}
            aria-label={isOwner ? 'Click to view or change cover photo' : undefined}
          >
            {profile.cover_url ? (
              <img src={profile.cover_url} alt={`${profile.name} cover`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-orange-100/50 via-pink-100/40 to-blue-100/50 dark:from-orange-900/20 dark:via-pink-900/20 dark:to-blue-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-200/40 via-pink-200/30 to-blue-200/40 dark:from-orange-800/20 dark:via-pink-800/20 dark:to-blue-800/20" />
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="hearts" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M50 70 L30 50 Q20 40 30 30 T50 30 T70 30 Q80 40 70 50 Z" fill="currentColor" opacity="0.1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hearts)"/>
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent dark:from-gray-900/40" />
            {isOwner && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Click to view or change cover photo
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative -mt-20 sm:-mt-24 lg:-mt-28">
            <div className="flex flex-col lg:flex-row items-center lg:items-end justify-center lg:justify-start gap-4 lg:gap-6 lg:pl-6">
              {/* Avatar */}
              <Avatar
                className={`h-28 w-28 sm:h-32 sm:w-32 lg:h-40 lg:w-40 ring-6 ring-white dark:ring-gray-900 shadow-2xl transition-transform duration-200 hover:scale-105 bg-white dark:bg-gray-800 mx-auto lg:mx-0 lg:ml-8 ${isOwner ? 'cursor-pointer' : ''}`}
                onClick={() => isOwner && openImageModal('profile')}
              >
                {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.name} />}
                <AvatarFallback className="text-4xl lg:text-5xl font-bold bg-gradient-to-br from-[#F2A024] to-orange-500 text-white">
                  {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DD'}
                </AvatarFallback>
              </Avatar>

              {/* Info & Actions */}
              <div className="flex-1 pb-2 w-full">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left: Name & Info */}
                  <div className="flex-1 pt-0 text-center lg:text-left">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight mb-1">
                      {profile.name}
                    </h1>
                    
                    <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap mb-1">
                      <Badge className="bg-gray-700 hover:bg-gray-600 text-white border-0 px-3 py-1.5 text-sm font-medium">
                        Donor Account
                      </Badge>
                    </div>
                    
                    {profile.location && (
                      <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Action Buttons */}
                  {isOwner ? (
                    <div className="flex items-center justify-center lg:justify-end gap-2 pt-2 flex-wrap">
                      <Button
                        onClick={openEditDialog}
                        className="bg-[#F2A024] hover:bg-[#E89015] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={handleShare}
                        className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-9 w-9 sm:h-10 sm:w-10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" side="bottom" sideOffset={6} className="w-44 sm:w-48 max-w-[90vw] z-[60]">
                          <DropdownMenuItem onClick={openEditDialog}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleShare}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center lg:justify-end gap-2 pt-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        onClick={handleShare}
                        className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      {/* Only show Report button if viewer is a charity */}
                      {user?.role === 'charity' && (
                        <Button 
                          variant="outline" 
                          onClick={() => setReportDialogOpen(true)}
                          className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Report
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 pt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-8">
          {statsConfig.map((stat, index) => (
            <div 
              key={index}
              onClick={stat.onClick}
              className={stat.onClick ? 'cursor-pointer' : ''}
            >
              <MetricCard {...stat} />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full mb-4">
            <TabsList className="!block !bg-transparent !p-0 !rounded-none !justify-start h-auto w-full overflow-x-auto whitespace-nowrap px-2 [-ms-overflow-style:none] [scrollbar-width:none]" role="tablist">
              <div className="inline-flex min-w-max items-center gap-2 sm:gap-4">
                <TabsTrigger
                  value="about"
                  role="tab"
                  aria-controls="about-panel"
                  className="rounded-none border-b-2 border-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent shrink-0"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="milestones"
                  role="tab"
                  aria-controls="milestones-panel"
                  className="rounded-none border-b-2 border-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent shrink-0"
                >
                  Milestones
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  role="tab"
                  aria-controls="activity-panel"
                  className="rounded-none border-b-2 border-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent shrink-0"
                >
                  Recent Activity
                </TabsTrigger>
                {isOwner && (
                  <TabsTrigger
                    value="saved"
                    role="tab"
                    aria-controls="saved-panel"
                    className="rounded-none border-b-2 border-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent shrink-0"
                  >
                    Saved
                  </TabsTrigger>
                )}
              </div>
            </TabsList>
          </div>

          {/* About Tab */}
          <TabsContent value="about" id="about-panel" role="tabpanel" className="mt-6">
            <DonorAbout profile={profile} isOwner={isOwner} />
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" id="milestones-panel" role="tabpanel" className="mt-6">
            <MilestonesGrid milestones={milestones} loading={milestonesLoading} />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" id="activity-panel" role="tabpanel" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Large Card - Activity List */}
              <div className="md:col-span-2">
                <ActivityList
                  donations={donations}
                  loading={activityLoading}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                />
              </div>

              {/* Right Small Card - Quick Actions */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => navigate('/donor/campaigns/browse')} 
                      className="w-full"
                      variant="outline"
                    >
                      Explore Campaigns
                    </Button>
                    <Button 
                      onClick={() => navigate('/donor/donations')} 
                      className="w-full"
                      variant="outline"
                    >
                      View All Donations
                    </Button>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Activity Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Donations</p>
                        <p className="text-xl font-bold">{donations.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Saved Tab */}
          {isOwner && (
            <TabsContent value="saved" id="saved-panel" role="tabpanel" className="mt-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-xl font-semibold">My Saved Items</h2>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/donor/saved')}>
                    View All
                  </Button>
                </div>

                {savedLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    {/* Saved Charities Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Saved Charities ({savedItems.charities.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {savedItems.charities.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No saved charities yet</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {savedItems.charities.slice(0, 3).map((item: any) => {
                              const charity = item.savable;
                              if (!charity) return null;
                              return (
                                <Card key={item.id} className="hover:shadow-md transition-shadow">
                                  <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                        {charity.logo_path ? (
                                          <img
                                            src={getCharityLogoUrl(charity.logo_path) || ''}
                                            alt={charity.name}
                                            className="h-full w-full object-cover rounded-lg"
                                          />
                                        ) : (
                                          <Building2 className="h-6 w-6 text-muted-foreground" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm line-clamp-2">{charity.name}</h3>
                                        {charity.city && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {charity.city}, {charity.province}
                                          </p>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="mt-2 w-full"
                                          onClick={() => navigate(`/donor/charity/${charity.id}`)}
                                        >
                                          <Eye className="h-3 w-3 mr-1" />
                                          View
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Saved Campaigns Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5" />
                          Saved Campaigns ({savedItems.campaigns.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {savedItems.campaigns.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No saved campaigns yet</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {savedItems.campaigns.slice(0, 4).map((item: any) => {
                              const campaign = item.savable;
                              if (!campaign) return null;
                              return (
                                <Card key={item.id} className="hover:shadow-md transition-shadow">
                                  <CardContent className="pt-6">
                                    <div className="space-y-3">
                                      <h3 className="font-semibold line-clamp-2">{campaign.title}</h3>
                                      {campaign.charity && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                          <Building2 className="h-3 w-3" />
                                          {campaign.charity.name}
                                        </p>
                                      )}
                                      {campaign.goal_amount && (
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>₱{(campaign.current_amount || 0).toLocaleString()}</span>
                                            <span>₱{campaign.goal_amount.toLocaleString()}</span>
                                          </div>
                                          <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                              className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full"
                                              style={{
                                                width: `${Math.min(((campaign.current_amount || 0) / campaign.goal_amount) * 100, 100)}%`
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                      <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                      >
                                        View Campaign
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Saved Posts Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Saved Posts ({savedItems.posts.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {savedItems.posts.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No saved posts yet</p>
                        ) : (
                          <div className="space-y-3">
                            {savedItems.posts.slice(0, 3).map((item: any) => {
                              const post = item.savable;
                              if (!post) return null;
                              return (
                                <Card key={item.id} className="hover:shadow-md transition-shadow">
                                  <CardContent className="pt-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-sm line-clamp-2">{post.title}</h4>
                                        {post.charity && (
                                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <Building2 className="h-3 w-3" />
                                            {post.charity.name}
                                          </p>
                                        )}
                                        {post.content && (
                                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                            {post.content}
                                          </p>
                                        )}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => navigate(`/donor/charity/${post.charity_id}`)}
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* View All Button */}
                    <div className="text-center">
                      <Button onClick={() => navigate('/donor/saved')} size="lg">
                        View All Saved Items
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Edit Profile Dialog - Enhanced */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[90vw] max-w-[95vw] sm:w-full sm:max-w-3xl max-h-[85vh] sm:max-h-[90vh] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information and preferences
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+63 912 345 6789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={editForm.date_of_birth}
                    onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell others about yourself and your passion for giving..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">Interests & Causes</Label>
                <Textarea
                  id="interests"
                  value={editForm.interests}
                  onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
                  placeholder="e.g., Education, Healthcare, Environment, Animal Welfare..."
                  rows={2}
                />
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Address Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="street_address">Street Address</Label>
                <Input
                  id="street_address"
                  value={editForm.street_address}
                  onChange={(e) => setEditForm({ ...editForm, street_address: e.target.value })}
                  placeholder="123 Main Street, Barangay Name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City/Municipality</Label>
                  <Input
                    id="city"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="e.g., Quezon City"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={editForm.province}
                    onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                    placeholder="e.g., Metro Manila"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    placeholder="e.g., NCR"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal/Zip Code</Label>
                  <Input
                    id="postal_code"
                    value={editForm.postal_code}
                    onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                    placeholder="e.g., 1100"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile} className="bg-[#F2A024] hover:bg-[#E89015]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer / Uploader */}
      {isOwner && (
        <ImageViewerModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          imageUrl={imageModalType === 'profile' ? (profile.avatar_url || null) : (profile.cover_url || null)}
          imageType={imageModalType}
          charityName={profile.name}
          onImageUpdate={handleImageUpdate}
        />
      )}
      
      {/* Followed Charities Modal */}
      {isOwner && (
        <FollowedCharitiesModal
          open={showFollowedModal}
          onOpenChange={setShowFollowedModal}
          onUpdate={fetchFollowedCount}
        />
      )}

      {/* Report Dialog - Only for charity viewers */}
      {profile && !isOwner && user?.role === 'charity' && (
        <ReportDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          targetType="user"
          targetId={profile.id}
          targetName={profile.name}
        />
      )}
    </div>
  );
}
