import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Heart, MapPin, Eye, X, UserPlus, Users, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { buildStorageUrl } from "@/lib/api";

interface Charity {
  id: number;
  name: string;
  logo_path: string | null;
  tagline: string;
  city: string;
  province: string;
}

interface Follow {
  id: number;
  charity: Charity;
  created_at: string;
}

interface FollowedCharitiesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function FollowedCharitiesModal({ open, onOpenChange, onUpdate }: FollowedCharitiesModalProps) {
  const [follows, setFollows] = useState<Follow[]>([]);
  const [suggestedCharities, setSuggestedCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [unfollowDialog, setUnfollowDialog] = useState<{ open: boolean; follow: Follow | null }>({
    open: false,
    follow: null,
  });
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (open) {
      fetchFollows();
      fetchSuggestions();
    }
  }, [open]);

  const fetchFollows = async () => {
    try {
      const response = await api.get("/me/following");
      const data = response.data;
      setFollows(Array.isArray(data) ? data : []);
      const ids = new Set(Array.isArray(data) ? data.map((f: Follow) => f.charity.id) : []);
      setFollowingIds(ids);
    } catch (error: any) {
      console.error("Failed to fetch follows", error);
      // Don't show error toast immediately, just set empty array
      setFollows([]);
      setFollowingIds(new Set());
      
      // Only show error if it's not a 500 (backend might not be ready)
      if (error.response?.status !== 500) {
        toast({
          title: "Error",
          description: "Failed to load followed charities",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get("/charities", {
        params: { limit: 6, sort: 'followers' }
      });
      // Ensure we always set an array
      const data = response.data.data || response.data;
      setSuggestedCharities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch suggestions", error);
      setSuggestedCharities([]); // Set empty array on error
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleUnfollow = async () => {
    if (!unfollowDialog.follow) return;

    try {
      await api.delete(`/follows/${unfollowDialog.follow.id}`);
      toast({
        title: "Unfollowed",
        description: `You unfollowed ${unfollowDialog.follow.charity.name}`,
      });
      setUnfollowDialog({ open: false, follow: null });
      fetchFollows();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to unfollow charity",
        variant: "destructive",
      });
    }
  };

  const handleFollow = async (charity: Charity) => {
    try {
      await api.post(`/charities/${charity.id}/follow`);
      toast({
        title: "Following",
        description: `You're now following ${charity.name}`,
      });
      fetchFollows();
      fetchSuggestions();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to follow charity",
        variant: "destructive",
      });
    }
  };

  const buildLogoUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return buildStorageUrl(path);
  };

  // Safely filter suggestions - ensure suggestedCharities is an array
  const filteredSuggestions = Array.isArray(suggestedCharities) 
    ? suggestedCharities.filter(charity => !followingIds.has(charity.id))
    : [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Followed Charities</DialogTitle>
                <DialogDescription>
                  Charities you're supporting and staying updated with
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {/* Followed Charities List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : follows.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-semibold mb-2">No Charities Followed Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start following charities to see them here
                </p>
                <Button onClick={() => navigate("/donor/charities")}>
                  Browse Charities
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {follows.map((follow) => (
                  <div
                    key={follow.id}
                    className="group relative overflow-hidden rounded-2xl border bg-card hover:shadow-lg transition-all duration-200"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Logo */}
                        <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-border">
                          {follow.charity.logo_path ? (
                            <img
                              src={buildLogoUrl(follow.charity.logo_path) || undefined}
                              alt={follow.charity.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Heart className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg truncate">{follow.charity.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {follow.charity.tagline}
                          </p>
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {follow.charity.city}, {follow.charity.province}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Following since {new Date(follow.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/donor/charities/${follow.charity.id}`)}
                            className="flex-shrink-0"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setUnfollowDialog({ open: true, follow })}
                            className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Unfollow
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Charities */}
            {filteredSuggestions.length > 0 && (
              <div className="pt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Suggested Charities</h3>
                </div>

                {loadingSuggestions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredSuggestions.slice(0, 4).map((charity) => (
                      <div
                        key={charity.id}
                        className="group rounded-xl border bg-card hover:shadow-md transition-all duration-200 p-3"
                      >
                        <div className="flex items-start gap-3">
                          {/* Logo */}
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                            {charity.logo_path ? (
                              <img
                                src={buildLogoUrl(charity.logo_path) || undefined}
                                alt={charity.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Heart className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm truncate">{charity.name}</h5>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {charity.tagline}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <MapPin className="h-2.5 w-2.5" />
                              <span className="truncate">{charity.city}</span>
                            </div>
                          </div>

                          {/* Follow Button */}
                          <Button
                            size="sm"
                            onClick={() => handleFollow(charity)}
                            className="flex-shrink-0 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white h-8"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/donor/charities")}
              className="text-primary"
            >
              Browse All Charities
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unfollow Confirmation */}
      <AlertDialog open={unfollowDialog.open} onOpenChange={(open) => setUnfollowDialog({ ...unfollowDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unfollow {unfollowDialog.follow?.charity.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              You won't receive updates about their campaigns and activities anymore. You can always follow them again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnfollow}
              className="bg-destructive hover:bg-destructive/90"
            >
              Unfollow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
