import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, Smartphone, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface NotificationPreference {
  category: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: string;
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    { category: "donations", email: true, push: true, sms: false, frequency: "instant" },
    { category: "campaigns", email: true, push: false, sms: false, frequency: "daily" },
    { category: "charities", email: true, push: true, sms: false, frequency: "instant" },
    { category: "support", email: true, push: true, sms: false, frequency: "instant" },
    { category: "security", email: true, push: true, sms: true, frequency: "instant" },
    { category: "marketing", email: false, push: false, sms: false, frequency: "weekly" },
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await api.get("/me/notification-preferences");
      if (response.data.preferences) {
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      console.error("Failed to fetch preferences", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/me/notification-preferences", { preferences });
      toast({
        title: "Success",
        description: "Notification preferences updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (index: number, field: string, value: any) => {
    const updated = [...preferences];
    updated[index] = { ...updated[index], [field]: value };
    setPreferences(updated);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      donations: "💰",
      campaigns: "📢",
      charities: "❤️",
      support: "🎫",
      security: "🔒",
      marketing: "📧",
    };
    return icons[category] || "🔔";
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      donations: "Donations",
      campaigns: "Campaigns",
      charities: "Charities & Updates",
      support: "Support & Help",
      security: "Security Alerts",
      marketing: "Marketing & News",
    };
    return names[category] || category;
  };

  const getCategoryDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      donations: "Donation confirmations, receipts, and recurring donation updates",
      campaigns: "New campaigns from followed charities and campaign milestones",
      charities: "Updates, posts, and news from charities you follow",
      support: "Support ticket updates and responses from our team",
      security: "Login alerts, password changes, and security notifications",
      marketing: "CharityHub news, features, and promotional content",
    };
    return descriptions[category] || "";
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
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Bell className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Notification Preferences</h1>
            <p className="text-muted-foreground">
              Manage how and when you receive notifications
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {preferences.map((pref, index) => (
          <Card key={pref.category}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCategoryIcon(pref.category)}</span>
                <div>
                  <CardTitle>{getCategoryName(pref.category)}</CardTitle>
                  <CardDescription>{getCategoryDescription(pref.category)}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Email */}
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={`email-${index}`}>Email</Label>
                    </div>
                    <Switch
                      id={`email-${index}`}
                      checked={pref.email}
                      onCheckedChange={(checked) =>
                        updatePreference(index, "email", checked)
                      }
                    />
                  </div>

                  {/* Push */}
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={`push-${index}`}>Push</Label>
                    </div>
                    <Switch
                      id={`push-${index}`}
                      checked={pref.push}
                      onCheckedChange={(checked) =>
                        updatePreference(index, "push", checked)
                      }
                    />
                  </div>

                  {/* SMS */}
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={`sms-${index}`}>SMS</Label>
                    </div>
                    <Switch
                      id={`sms-${index}`}
                      checked={pref.sms}
                      onCheckedChange={(checked) =>
                        updatePreference(index, "sms", checked)
                      }
                      disabled={pref.category !== "security"}
                    />
                  </div>
                </div>

                {/* Frequency */}
                <div className="flex items-center gap-4">
                  <Label htmlFor={`frequency-${index}`}>Frequency:</Label>
                  <Select
                    value={pref.frequency}
                    onValueChange={(value) =>
                      updatePreference(index, "frequency", value)
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                      {pref.category === "marketing" && (
                        <SelectItem value="monthly">Monthly</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <CheckCircle className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> SMS notifications are only available for security alerts. Email and push notifications can be customized for all categories. Changes take effect immediately.
        </p>
      </div>
    </div>
  );
}
