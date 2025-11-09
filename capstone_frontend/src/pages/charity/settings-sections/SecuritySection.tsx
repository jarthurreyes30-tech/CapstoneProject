import { useState } from "react";
import { Lock, Shield, Key, Activity, Smartphone, QrCode, AlertTriangle, Copy, Download, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTwoFactor } from "@/hooks/useTwoFactor";

export default function SecuritySection() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1); // 1: QR, 2: Verify, 3: Recovery
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  const [disablePassword, setDisablePassword] = useState("");
  
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Use the shared 2FA hook for charity admin
  const {
    status,
    loading,
    qrCode,
    secret,
    recoveryCodes,
    isEnabled,
    fetchStatus,
    enableTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    downloadRecoveryCodes,
    copyToClipboard,
  } = useTwoFactor({ role: 'charity_admin' });

  const recentLogins = [
    { device: "Windows PC", location: "Manila, Philippines", time: "2 hours ago", current: true },
    { device: "Mobile App", location: "Quezon City, Philippines", time: "1 day ago", current: false },
    { device: "Chrome Browser", location: "Makati, Philippines", time: "3 days ago", current: false },
  ];

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      // TODO: API call for password change
      toast.success("Password changed successfully");
      setIsPasswordDialogOpen(false);
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  const handleEnableStart = async () => {
    try {
      await enableTwoFactor();
      setShowEnableDialog(false);
      setSetupStep(1);
      setShowSetupModal(true);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleVerifyAndActivate = async () => {
    setVerifying(true);
    setCodeValid(null);
    
    try {
      await verifyTwoFactor(verificationCode);
      setCodeValid(true);
      
      // Move to Step 3: Show recovery codes
      setTimeout(() => {
        setVerificationCode("");
        setCodeValid(null);
        setSetupStep(3);
      }, 800);
    } catch (error) {
      setCodeValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable = async () => {
    try {
      await disableTwoFactor(disablePassword);
      setShowDisableDialog(false);
      setDisablePassword("");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCloseSetup = () => {
    setShowSetupModal(false);
    setSetupStep(1);
    setVerificationCode("");
    setCodeValid(null);
  };

  const copyAllRecoveryCodes = () => {
    const text = recoveryCodes.join("\n");
    copyToClipboard(text, "All recovery codes");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Security & Access Control</h2>
        <p className="text-muted-foreground">Manage your account security and access settings</p>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Password
          </CardTitle>
          <CardDescription>Update your password regularly to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
              </div>
            </div>
            <Button onClick={() => setIsPasswordDialogOpen(true)}>Change Password</Button>
          </div>

          <Alert className="mt-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>Add an extra layer of security to your charity account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`flex items-center justify-between p-4 border-2 rounded-lg transition-colors ${
            isEnabled ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                isEnabled ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-200 dark:bg-gray-800'
              }`}>
                {isEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-semibold">
                  {isEnabled ? "2FA Enabled" : "2FA Disabled"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isEnabled 
                    ? "Your account is protected with 2FA"
                    : "Enable 2FA to secure your account"}
                </p>
              </div>
            </div>
            {isEnabled ? (
              <Button variant="destructive" onClick={() => setShowDisableDialog(true)} disabled={loading}>
                Disable 2FA
              </Button>
            ) : (
              <Button onClick={() => setShowEnableDialog(true)} disabled={loading}>
                Enable 2FA
              </Button>
            )}
          </div>

          {isEnabled && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                2FA is active. You'll need your authentication app to sign in. Keep your recovery codes safe!
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>How it works:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>Scan the QR code we provide</li>
                <li>Enter the 6-digit code from your app when logging in</li>
                <li>Save your recovery codes in a secure place</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Login Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Login Activity
          </CardTitle>
          <CardDescription>Recent sign-ins and device locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogins.map((login, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{login.device}</p>
                    <p className="text-xs text-muted-foreground">{login.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{login.time}</p>
                  {login.current && (
                    <Badge variant="outline" className="mt-1 text-xs">Current Session</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enable 2FA Confirmation Dialog */}
      <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              You'll need an authenticator app on your phone to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <QrCode className="h-4 w-4" />
              <AlertDescription>
                <strong>Before you begin:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Download an authenticator app (Google Authenticator, Authy, Microsoft Authenticator)</li>
                  <li>Have your phone ready to scan a QR code</li>
                  <li>Prepare to save recovery codes in a secure place</li>
                </ul>
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEnableDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleEnableStart} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3-Step Setup Modal */}
      <Dialog open={showSetupModal} onOpenChange={(open) => {
        if (!open && setupStep !== 3) {
          if (window.confirm("Setup is not complete. Are you sure you want to close?")) {
            handleCloseSetup();
          }
        } else {
          if (!open) handleCloseSetup();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-yellow-500" />
              {setupStep === 1 && "Scan QR Code"}
              {setupStep === 2 && "Verify Code"}
              {setupStep === 3 && "Save Recovery Codes"}
            </DialogTitle>
            <DialogDescription>
              Step {setupStep} of 3
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* STEP 1: QR CODE */}
            {setupStep === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Scan this QR code with your authenticator app to link your account
                  </p>
                  
                  <div className="flex justify-center p-6 bg-muted/30 rounded-2xl border">
                    {qrCode ? (
                      <img 
                        src={`data:image/svg+xml;base64,${qrCode}`} 
                        alt="QR Code" 
                        className="w-64 h-64 rounded-xl" 
                      />
                    ) : (
                      <div className="w-64 h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Can't scan? Enter this code manually:</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="px-4 py-2 bg-muted border rounded-lg font-mono text-sm">
                        {secret}
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => copyToClipboard(secret, "Secret key")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setSetupStep(2)} 
                  className="w-full"
                  size="lg"
                >
                  Continue to Verification
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* STEP 2: VERIFY CODE */}
            {setupStep === 2 && (
              <div className="space-y-6">
                <p className="text-muted-foreground text-center">
                  Enter the 6-digit code from your authenticator app
                </p>
                
                <div className="space-y-3">
                  <Label htmlFor="verificationCode" className="text-center block">
                    6-Digit Verification Code
                  </Label>
                  <div className="relative">
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setCodeValid(null);
                      }}
                      maxLength={6}
                      disabled={verifying}
                      className={`
                        text-center text-3xl font-mono tracking-[0.5em] h-16 
                        bg-background border-2 transition-all
                        ${codeValid === true ? 'border-green-500 ring-2 ring-green-500/20' : ''}
                        ${codeValid === false ? 'border-red-500 ring-2 ring-red-500/20' : ''}
                        ${codeValid === null && verificationCode.length === 6 ? 'border-yellow-500' : ''}
                      `}
                    />
                    {codeValid === true && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </div>
                    )}
                    {codeValid === false && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                      </div>
                    )}
                  </div>
                  
                  {codeValid === false && (
                    <p className="text-sm text-red-500 text-center">
                      Invalid code. Please check and try again.
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground text-center">
                    The code refreshes every 30 seconds
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setSetupStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleVerifyAndActivate} 
                    disabled={verificationCode.length !== 6 || verifying}
                    className="flex-1"
                    size="lg"
                  >
                    {verifying ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                        Verifying...
                      </>
                    ) : codeValid === true ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Verified!
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Verify & Enable
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: RECOVERY CODES */}
            {setupStep === 3 && (
              <div className="space-y-6">
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    <strong>Success!</strong> Two-factor authentication is now enabled for your charity account.
                  </AlertDescription>
                </Alert>

                <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    <strong>Important:</strong> Save these recovery codes now. Each code can only be used once. Without them, you may lose access if you lose your phone.
                  </AlertDescription>
                </Alert>
                
                {recoveryCodes.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-muted/30 border p-4 rounded-xl">
                      <div className="grid grid-cols-2 gap-2">
                        {recoveryCodes.map((code, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between bg-background p-2 rounded border"
                          >
                            <code className="font-mono text-sm font-bold">
                              {code}
                            </code>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0" 
                              onClick={() => copyToClipboard(code, "Recovery code")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={copyAllRecoveryCodes} 
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                      <Button 
                        onClick={downloadRecoveryCodes} 
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={handleCloseSetup}
                  className="w-full"
                  size="lg"
                >
                  I've Saved My Recovery Codes
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to disable 2FA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Disabling 2FA will make your account less secure. We recommend keeping it enabled.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="disablePassword">Password</Label>
              <Input
                id="disablePassword"
                type="password"
                placeholder="Enter your password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDisableDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDisable} 
                className="flex-1"
                disabled={!disablePassword}
              >
                Disable 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
