import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Heart,
  MoreVertical,
  Edit,
  Pause,
  Play,
  Trash2,
  Share2,
  Users,
  Target,
  Calendar,
  TrendingUp,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DonationsModal } from "./DonationsModal";
import { buildStorageUrl } from "@/lib/api";
import api from "@/lib/axios";
import { toast } from "sonner";

export interface Campaign {
  id: number;
  title: string;
  description: string;
  goal: number;
  amountRaised: number;
  donorsCount: number;
  views: number;
  status: "active" | "completed" | "draft" | "expired";
  bannerImage?: string;
  endDate: string;
  createdAt: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  viewMode?: "admin" | "donor";
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onToggleStatus?: (id: number, currentStatus: string) => void;
  onShare?: (id: number) => void;
  isSaved?: boolean;
  onSaveToggle?: (id: number, isSaved: boolean) => void;
}

export const CampaignCard = ({
  campaign,
  viewMode = "admin",
  onEdit,
  onDelete,
  onToggleStatus,
  onShare,
  isSaved: initialSaved = false,
  onSaveToggle,
}: CampaignCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [showDonationsModal, setShowDonationsModal] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [savingState, setSavingState] = useState(false);

  // Calculate progress percentage (only when goal > 0)
  const hasGoal = typeof campaign.goal === 'number' && campaign.goal > 0;
  const progressPercentage = hasGoal
    ? Math.min(Math.round((campaign.amountRaised / campaign.goal) * 100), 100)
    : 0;

  // Calculate days left
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(campaign.endDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  // Determine actual status based on end date and goal
  const determineActualStatus = (): Campaign["status"] => {
    // Keep draft as draft
    if (campaign.status === "draft") return "draft";
    
    // Check if campaign has ended
    const hasEnded = daysLeft === 0;
    
    // Check if goal is reached (only meaningful when a goal exists)
    const goalReached = hasGoal && progressPercentage >= 100;
    
    // If ended or goal reached, mark as completed
    if (hasEnded || goalReached) {
      return "completed";
    }
    
    // Otherwise use the provided status
    return campaign.status;
  };

  const actualStatus = determineActualStatus();

  // Status badge configuration
  const statusConfig = {
    active: {
      label: "Active",
      color: "bg-green-500 hover:bg-green-600",
      tooltip: "Campaign is active and accepting donations",
    },
    completed: {
      label: "Completed",
      color: "bg-blue-500 hover:bg-blue-600",
      tooltip: "Campaign has reached its goal",
    },
    draft: {
      label: "Draft",
      color: "bg-yellow-500 hover:bg-yellow-600",
      tooltip: "Campaign is in draft mode",
    },
    expired: {
      label: "Expired",
      color: "bg-red-500 hover:bg-red-600",
      tooltip: "Campaign has ended",
    },
  };

  const currentStatus = statusConfig[actualStatus];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Sync saved state with prop changes
  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  // Handle save/unsave campaign
  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (savingState) return;
    
    setSavingState(true);
    
    try {
      if (isSaved) {
        // Find and delete the saved item
        const savedResponse = await api.get('/me/saved');
        const savedItems = savedResponse.data.all || [];
        const savedItem = savedItems.find(
          (item: any) => item.savable_id === campaign.id && item.savable_type.includes('Campaign')
        );
        
        if (savedItem) {
          await api.delete(`/me/saved/${savedItem.id}`);
          toast.success('Campaign removed from saved items');
        } else {
          // Item not found, just update the UI
          toast.info('Campaign already removed');
        }
      } else {
        // Save the campaign
        const response = await api.post('/me/saved', {
          savable_id: campaign.id,
          savable_type: 'campaign',
        });
        
        // Check if it was already saved
        if (response.data.was_recently_created === false) {
          toast.info('Campaign already in your saved items');
        } else {
          toast.success('Campaign saved successfully');
        }
      }
      
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);
      
      // Notify parent component
      if (onSaveToggle) {
        onSaveToggle(campaign.id, newSavedState);
      }
    } catch (error: any) {
      console.error('Error toggling save:', error);
      
      // Better error handling
      const errorMessage = error.response?.data?.message || error.message;
      
      // If it's a duplicate error, just update the state
      if (errorMessage && errorMessage.toLowerCase().includes('already')) {
        setIsSaved(true);
        if (onSaveToggle) {
          onSaveToggle(campaign.id, true);
        }
        toast.info('Campaign already in your saved items');
      } else {
        toast.error(
          errorMessage || 
          (isSaved ? 'Failed to remove from saved' : 'Failed to save campaign')
        );
      }
    } finally {
      setSavingState(false);
    }
  };

  // Default banner image
  const fallbackBanner = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect fill='%23f0f0f0' width='800' height='400'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='40' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ECampaign Banner%3C/text%3E%3C/svg%3E";
  const resolvedBanner = campaign.bannerImage ? buildStorageUrl(campaign.bannerImage) : null;
  const cacheBust = typeof campaign.createdAt === 'string' ? Date.parse(campaign.createdAt || '') || Date.now() : Date.now();
  const bannerUrl = resolvedBanner && !imageError ? `${resolvedBanner}?v=${cacheBust}` : fallbackBanner;

  return (
    <>
    <Card className="group h-full flex flex-col overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 border-border/40 bg-card">
      {/* Banner Image Section */}
      <div className="relative h-44 md:h-48 overflow-hidden bg-muted">
        <img
          src={bannerUrl || undefined}
          alt={campaign.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            console.warn('[CampaignCard] image failed to load:', resolvedBanner);
            setImageError(true);
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            className={`${currentStatus.color} border-0 shadow-lg px-3 py-1 text-xs font-semibold`}
            title={currentStatus.tooltip}
          >
            {currentStatus.label}
          </Badge>
        </div>

        {/* Admin Actions Dropdown */}
        {viewMode === "admin" && (
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 bg-card hover:bg-card/90 shadow-lg backdrop-blur-sm border border-border"
                >
                  <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-card-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-[60]">
                <DropdownMenuItem onClick={() => onEdit?.(campaign.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Campaign
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onToggleStatus?.(campaign.id, campaign.status)}
                >
                  {campaign.status === "active" ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Campaign
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Activate Campaign
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(campaign.id)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Campaign
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDonationsModal(true)}>
                  <Heart className="mr-2 h-4 w-4" />
                  View Donations
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(campaign.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Campaign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardHeader className="pb-3 pt-4 px-4 sm:px-5 lg:px-6 min-h-[120px]">
        <h3 className="text-lg sm:text-xl font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {campaign.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {campaign.description}
        </p>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 lg:px-6 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Raised</p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(campaign.amountRaised)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Donors</p>
                <p className="text-base font-semibold text-foreground">
                  {campaign.donorsCount}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {hasGoal && (
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Goal</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(campaign.goal)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Days Left</p>
                <p className="text-base font-semibold text-foreground">
                  {daysLeft > 0 ? daysLeft : "Ended"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar - Only show when campaign has a goal */}
        {hasGoal && (
          <div className="space-y-2 mt-4">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progressPercentage}% funded</span>
              <span>{formatCurrency(campaign.amountRaised)} of {formatCurrency(campaign.goal)}</span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="grid grid-cols-2 gap-2 px-4 sm:px-5 lg:px-6 pt-3 pb-4 mt-auto">
          {viewMode === "admin" ? (
            <>
              <Button
                variant="outline"
                className="h-9 sm:h-10 min-w-0 px-3 sm:px-4 text-xs sm:text-sm"
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
              >
                <Eye className="mr-1 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">View Campaign</span>
              </Button>
              <Button
                variant="outline"
                className="h-9 sm:h-10 min-w-0 px-3 sm:px-4 text-xs sm:text-sm"
                onClick={() => setShowDonationsModal(true)}
              >
                <Heart className="mr-1 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">View Donations</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                className="flex-1 h-9 sm:h-10 bg-primary hover:bg-primary/90"
                onClick={() => navigate(`/donor/campaigns/${campaign.id}/donate`)}
              >
                <Heart className="mr-2 h-4 w-4" />
                Donate Now
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-9 sm:h-10"
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 flex-shrink-0"
                onClick={handleSaveToggle}
                disabled={savingState}
                title={isSaved ? "Remove from saved" : "Save campaign"}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-primary fill-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
      </CardFooter>
    </Card>

    {/* Donations Modal */}
    <DonationsModal
      open={showDonationsModal}
      onOpenChange={setShowDonationsModal}
      campaignId={campaign.id}
      campaignTitle={campaign.title}
    />
  </>
  );
};
