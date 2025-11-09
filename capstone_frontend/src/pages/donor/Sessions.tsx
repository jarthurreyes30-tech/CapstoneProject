import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Monitor, Smartphone, Tablet, MapPin, Clock, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface Session {
  id: number;
  device_type: string;
  browser: string;
  platform: string;
  ip_address: string;
  last_activity: string;
  is_current: boolean;
  created_at: string;
}

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; session: Session | null }>({
    open: false,
    session: null,
  });
  const [revokeAllDialog, setRevokeAllDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get("/me/sessions");
      setSessions(response.data);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
      toast({
        title: "Error",
        description: "Failed to load active sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeDialog.session) return;

    try {
      await api.delete(`/me/sessions/${revokeDialog.session.id}`);
      toast({
        title: "Success",
        description: "Session revoked successfully",
      });
      setRevokeDialog({ open: false, session: null });
      fetchSessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to revoke session",
        variant: "destructive",
      });
    }
  };

  const handleRevokeAll = async () => {
    try {
      const response = await api.post("/me/sessions/revoke-all");
      toast({
        title: "Success",
        description: `${response.data.count} sessions revoked successfully`,
      });
      setRevokeAllDialog(false);
      fetchSessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to revoke sessions",
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-6 w-6" />;
      case "tablet":
        return <Tablet className="h-6 w-6" />;
      default:
        return <Monitor className="h-6 w-6" />;
    }
  };

  const formatLastActivity = (date: string) => {
    const now = new Date();
    const activity = new Date(date);
    const diffMs = now.getTime() - activity.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Active Sessions</h1>
              <p className="text-muted-foreground">Manage devices with access to your account</p>
            </div>
          </div>
          {sessions.filter(s => !s.is_current).length > 0 && (
            <Button variant="destructive" onClick={() => setRevokeAllDialog(true)}>
              Revoke All Other Sessions
            </Button>
          )}
        </div>
      </div>

      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Tip:</strong> If you see a session you don't recognize, revoke it immediately and change your password.
        </AlertDescription>
      </Alert>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Sessions</h3>
              <p className="text-muted-foreground">You'll see your active sessions here</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className={session.is_current ? "border-primary border-2" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      {getDeviceIcon(session.device_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {session.browser} on {session.platform}
                        </CardTitle>
                        {session.is_current && (
                          <Badge variant="default" className="bg-green-500">
                            Current Session
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="capitalize">
                        {session.device_type} Device
                      </CardDescription>
                    </div>
                  </div>
                  {!session.is_current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRevokeDialog({ open: true, session })}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-foreground">IP Address</p>
                      <p>{session.ip_address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-foreground">Last Activity</p>
                      <p>{formatLastActivity(session.last_activity)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-foreground">Created</p>
                      <p>{new Date(session.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Revoke Single Session Dialog */}
      <Dialog open={revokeDialog.open} onOpenChange={(open) => setRevokeDialog({ ...revokeDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Session?</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this session? The device will be signed out immediately.
            </DialogDescription>
          </DialogHeader>
          {revokeDialog.session && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="flex items-center gap-3">
                {getDeviceIcon(revokeDialog.session.device_type)}
                <div>
                  <p className="font-medium">
                    {revokeDialog.session.browser} on {revokeDialog.session.platform}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {revokeDialog.session.ip_address}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              This action cannot be undone. The device will need to log in again.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialog({ open: false, session: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevoke}>
              Revoke Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke All Sessions Dialog */}
      <Dialog open={revokeAllDialog} onOpenChange={setRevokeAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke All Other Sessions?</DialogTitle>
            <DialogDescription>
              This will sign out all devices except your current one. They will need to log in again.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              <strong>Warning:</strong> This will immediately revoke {sessions.filter(s => !s.is_current).length} session(s).
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeAllDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevokeAll}>
              Revoke All Sessions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
