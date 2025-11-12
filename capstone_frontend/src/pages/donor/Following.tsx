import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, X, MapPin, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { getCharityLogoUrl } from "@/lib/storage";

interface Follow {
  id: number;
  charity: {
    id: number;
    name: string;
    logo_path: string;
    tagline: string;
    city: string;
    province: string;
    posts: Array<{
      id: number;
      title: string;
      created_at: string;
    }>;
  };
  created_at: string;
}

export default function Following() {
  const [follows, setFollows] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfollowDialog, setUnfollowDialog] = useState<{ open: boolean; follow: Follow | null }>({
    open: false,
    follow: null,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFollows();
  }, []);

  const fetchFollows = async () => {
    try {
      const response = await api.get("/me/following");
      setFollows(response.data);
    } catch (error) {
      console.error("Failed to fetch follows", error);
      toast({
        title: "Error",
        description: "Failed to load followed charities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!unfollowDialog.follow) return;

    try {
      await api.delete(`/follows/${unfollowDialog.follow.id}`);
      toast({
        title: "Success",
        description: `Unfollowed ${unfollowDialog.follow.charity.name}`,
      });
      setUnfollowDialog({ open: false, follow: null });
      fetchFollows();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to unfollow charity",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Following
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Charities you're supporting and staying updated with
          </p>
        </div>

      {follows.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Charities Followed</h3>
              <p className="text-muted-foreground mb-4">
                Start following charities to stay updated with their campaigns and progress.
              </p>
              <Button onClick={() => navigate("/donor/charities")}>
                Browse Charities
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {follows.map((follow) => (
            <Card key={follow.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {follow.charity.logo_path ? (
                        <img
                          src={getCharityLogoUrl(follow.charity.logo_path) || ''}
                          alt={follow.charity.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Heart className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{follow.charity.name}</CardTitle>
                      <CardDescription>{follow.charity.tagline}</CardDescription>
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {follow.charity.city}, {follow.charity.province}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUnfollowDialog({ open: true, follow })}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {follow.charity.posts && follow.charity.posts.length > 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-900 font-medium mb-1">Latest Update</p>
                    <p className="text-xs text-blue-700">{follow.charity.posts[0].title}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                      <Calendar className="h-3 w-3" />
                      {new Date(follow.charity.posts[0].created_at).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border rounded-lg p-3 mb-3">
                    <p className="text-sm text-muted-foreground">No recent updates</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/donor/charities/${follow.charity.id}`)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Profile
                  </Button>
                </div>
                <div className="mt-3 text-xs text-muted-foreground text-center">
                  Following since {new Date(follow.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Unfollow Confirmation Dialog */}
      <Dialog open={unfollowDialog.open} onOpenChange={(open) => setUnfollowDialog({ ...unfollowDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unfollow Charity?</DialogTitle>
            <DialogDescription>
              Are you sure you want to unfollow <strong>{unfollowDialog.follow?.charity.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              You won't receive updates about their campaigns and activities anymore. You can always follow them again later.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnfollowDialog({ open: false, follow: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnfollow}>
              Unfollow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
