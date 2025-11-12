import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Bell, Palette, Trash2, AlertTriangle, Shield, Eye, EyeOff, Check, X, ArrowLeft, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { authService } from "@/services/auth";
import api from "@/lib/axios";

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("");
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [downloadingData, setDownloadingData] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    showNameOnDonations: true,
    showDonationAmounts: false,
    allowCharityContact: true,
    publicProfile: true,
  });

  // Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    emailUpdates: true,
    campaignAlerts: true,
    charityUpdates: true,
    monthlyReport: false,
    donationReceipts: true,
    marketingEmails: false,
  });

  const handleSavePrivacy = () => {
    toast.success("Privacy settings updated successfully");
  };

  const handleSavePreferences = () => {
    toast.success("Preferences saved successfully");
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const token = authService.getToken();
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_URL}/me/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          new_password_confirmation: passwordData.confirmPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      toast.success("Password changed successfully");
      setIsPasswordDialogOpen(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };


  const handleDownloadData = async () => {
    try {
      setDownloadingData(true);
      toast.info("Preparing your data export...");
      
      const token = authService.getToken();
      if (!token) {
        toast.error('Please login first');
        return;
      }

      // Use api instance with responseType blob
      const response = await api.get('/me/export', {
        responseType: 'blob',
        timeout: 60000, // 60 second timeout for large exports
      });

      // Get the blob and download it
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `charityhub_data_${user?.id}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success("Your data has been downloaded successfully!");
    } catch (error: any) {
      console.error('Error downloading data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download data. Please try again.';
      toast.error(errorMessage);
    } finally {
      setDownloadingData(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivatePassword) {
      toast.error('Please enter your password to confirm');
      return;
    }

    try {
      setLoading(true);
      const token = authService.getToken();
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_URL}/me/deactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: deactivateReason,
          password: deactivatePassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to deactivate account');
      }

      toast.success("Account deactivated successfully. Admin will review your reactivation request when you log in again.");
      setDeactivateReason("");
      setDeactivatePassword("");
      logout();
    } catch (error: any) {
      console.error('Error deactivating account:', error);
      toast.error(error.message || 'Failed to deactivate account');
    } finally {
      setLoading(false);
      setIsDeactivateDialogOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    try {
      setLoading(true);
      const token = authService.getToken();
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_URL}/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast.success("Account deleted successfully");
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/donor/profile')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Account Settings</h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Manage your account details, preferences, and security
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="flex w-full h-auto gap-2 bg-transparent p-0">
            <TabsTrigger value="security" className="flex-1 whitespace-nowrap text-xs sm:text-sm py-2 px-3">Security</TabsTrigger>
            <TabsTrigger value="preferences" className="flex-1 whitespace-nowrap text-xs sm:text-sm py-2 px-3">Preferences</TabsTrigger>
            <TabsTrigger value="danger" className="flex-1 whitespace-nowrap text-xs sm:text-sm py-2 px-3">Danger Zone</TabsTrigger>
          </TabsList>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Password</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">
                      Update your password regularly to keep your account secure
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                    onClick={() => setIsPasswordDialogOpen(true)}
                  >
                    <Lock className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Two-Factor Authentication</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Add an extra layer of security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">2FA Protection</p>
                    <p className="text-sm text-muted-foreground">
                      Add an additional security layer to your account
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => window.location.href = '/donor/settings/2fa'}>
                    Manage 2FA
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Protect your account with two-factor authentication
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Active Sessions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage your active sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Current Device</p>
                      <p className="text-sm text-muted-foreground">Last active: Now</p>
                    </div>
                    <span className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Notification Settings</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage how you receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-updates" className="text-sm sm:text-base">Email Updates</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications about your donations
                    </p>
                  </div>
                  <Switch
                    id="email-updates"
                    checked={preferences.emailUpdates}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, emailUpdates: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="campaign-alerts" className="text-sm sm:text-base">New Campaign Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when charities you follow launch new campaigns
                    </p>
                  </div>
                  <Switch
                    id="campaign-alerts"
                    checked={preferences.campaignAlerts}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, campaignAlerts: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="charity-updates" className="text-sm sm:text-base">Charity Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates from charities you've donated to
                    </p>
                  </div>
                  <Switch
                    id="charity-updates"
                    checked={preferences.charityUpdates}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, charityUpdates: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="monthly-report" className="text-sm sm:text-base">Monthly Impact Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Get a monthly summary of your donation impact
                    </p>
                  </div>
                  <Switch
                    id="monthly-report"
                    checked={preferences.monthlyReport}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, monthlyReport: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Theme Preference</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Choose your display theme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 sm:gap-4">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                    >
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                    >
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("system")}
                    >
                      System
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Actions in this section are permanent and cannot be undone. Please proceed with caution.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Data Portability</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Download all your personal data in machine-readable format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium mb-2">Your export will include:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Profile information</li>
                    <li>Donation history (all transactions)</li>
                    <li>Recurring donations</li>
                    <li>Saved items and followed charities</li>
                    <li>Support tickets and messages</li>
                    <li>Account security logs</li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground">
                  All data will be provided in JSON format inside a ZIP file. This complies with GDPR data portability requirements.
                </p>

                <Button 
                  size="sm"
                  variant="outline" 
                  onClick={handleDownloadData}
                  disabled={downloadingData}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloadingData ? "Preparing Download..." : "Download My Data"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-yellow-600">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-yellow-600">Deactivate Account</CardTitle>
                <CardDescription>
                  Temporarily deactivate your account - you can reactivate it later
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-medium mb-2">Deactivation will:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Hide your profile from public view</li>
                    <li>Pause your recurring donations</li>
                    <li>Prevent new donations until reactivated</li>
                    <li>Keep your data safe for when you return</li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground">
                  You can reactivate your account anytime by logging in or visiting the account retrieval page.
                </p>

                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => setIsDeactivateDialogOpen(true)}
                  className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Deactivate My Account
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-destructive">Delete Account</CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-destructive/10 rounded-lg">
                  <p className="text-sm font-medium mb-2">This action will:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Permanently delete your account</li>
                    <li>Remove all your donation history</li>
                    <li>Cancel any recurring donations</li>
                    <li>Remove your profile from the platform</li>
                  </ul>
                </div>

                <Button 
                  size="sm"
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete My Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={loading}>
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Account Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-yellow-600">Deactivate Account</DialogTitle>
            <DialogDescription>
              Your account will be temporarily deactivated. You can reactivate it anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="border-yellow-600">
              <Shield className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                Your account will be temporarily deactivated. An admin will review your reactivation request when you try to log in again.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="deactivate-reason">Reason for Deactivation (Optional)</Label>
              <Textarea
                id="deactivate-reason"
                placeholder="Let us know why you're deactivating your account..."
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {deactivateReason.length}/500 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deactivate-password">Confirm Password *</Label>
              <Input
                id="deactivate-password"
                type="password"
                placeholder="Enter your password to confirm"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                For security, please enter your password to confirm deactivation
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeactivateDialogOpen(false);
              setDeactivateReason("");
              setDeactivatePassword("");
            }}>
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={handleDeactivateAccount}
              disabled={loading || !deactivatePassword}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? "Deactivating..." : "Deactivate Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                All your donation history, preferences, and profile data will be permanently deleted.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Type <span className="font-bold">DELETE</span> to confirm
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false);
              setDeleteConfirmText("");
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE" || loading}
            >
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
