import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, QrCode, Key, CheckCircle, AlertTriangle, Copy, Lock, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function TwoFactorAuth() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1); // 1: QR, 2: Verify, 3: Recovery
  
  // Enable 2FA states
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  
  // Disable 2FA state
  const [disablePassword, setDisablePassword] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get("/me/2fa/status");
      setIs2FAEnabled(response.data.enabled);
    } catch (error) {
      console.error("Failed to fetch 2FA status", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableStart = async () => {
    try {
      const response = await api.post("/me/2fa/enable");
      setQrCode(response.data.qr_code);
      setSecret(response.data.secret);
      setRecoveryCodes(response.data.recovery_codes);
      setShowEnableDialog(false);
      setSetupStep(1); // Start at Step 1: QR Code
      setShowSetupModal(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to enable 2FA",
        variant: "destructive",
      });
    }
  };

  const handleVerifyAndActivate = async () => {
    setVerifying(true);
    setCodeValid(null);
    
    try {
      const response = await api.post("/me/2fa/verify", {
        code: verificationCode,
      });
      
      setCodeValid(true);
      setIs2FAEnabled(true);
      
      toast({
        title: "Success!",
        description: "Two-factor authentication enabled successfully",
      });
      
      // Move to Step 3: Show recovery codes
      setTimeout(() => {
        setVerificationCode("");
        setCodeValid(null);
        setSetupStep(3);
      }, 800);
    } catch (error: any) {
      setCodeValid(false);
      toast({
        title: "Invalid Code",
        description: error.response?.data?.message || "Please check the code and try again",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const downloadRecoveryCodes = () => {
    const text = recoveryCodes.join('\n');
    const blob = new Blob([`CharityConnect 2FA Recovery Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${text}\n\n⚠️ Keep these codes safe! You'll need them if you lose access to your authenticator app.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `charityconnect-recovery-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Recovery codes saved to your downloads folder",
    });
  };

  const handleDisable = async () => {
    try {
      await api.post("/me/2fa/disable", {
        password: disablePassword,
      });
      
      setIs2FAEnabled(false);
      setShowDisableDialog(false);
      setDisablePassword("");
      
      toast({
        title: "2FA Disabled",
        description: "Two-Factor Authentication has been disabled",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to disable 2FA",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const copyAllRecoveryCodes = () => {
    const text = recoveryCodes.join("\n");
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "All recovery codes copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Card */}
          <div className={`p-4 rounded-lg border-2 ${is2FAEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${is2FAEnabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                  {is2FAEnabled ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">
                    {is2FAEnabled ? "2FA Enabled" : "2FA Disabled"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {is2FAEnabled 
                      ? "Your account is protected with 2FA"
                      : "Enable 2FA to secure your account"}
                  </p>
                </div>
              </div>
              {is2FAEnabled ? (
                <Button variant="destructive" onClick={() => setShowDisableDialog(true)}>
                  Disable 2FA
                </Button>
              ) : (
                <Button onClick={() => setShowEnableDialog(true)}>
                  Enable 2FA
                </Button>
              )}
            </div>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What is Two-Factor Authentication?</h3>
            <p className="text-muted-foreground">
              Two-Factor Authentication (2FA) adds an extra layer of security to your account. In addition to your password, you'll need to enter a code from your authenticator app when logging in.
            </p>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>How it works:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>Scan the QR code we provide</li>
                  <li>Enter the 6-digit code from your app when logging in</li>
                  <li>Save your recovery codes in a secure place</li>
                </ul>
              </AlertDescription>
            </Alert>
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
          // Warn user if closing before completion
          if (window.confirm("Setup is not complete. Are you sure you want to close?")) {
            setShowSetupModal(false);
            setSetupStep(1);
            setVerificationCode("");
            setCodeValid(null);
          }
        } else {
          setShowSetupModal(open);
          if (!open) {
            setSetupStep(1);
            setVerificationCode("");
            setCodeValid(null);
          }
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-yellow-500" />
              Set Up Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Step {setupStep} of 3
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            {/* Step 1: QR Code - Glassmorphism Card */}
            <div className="relative overflow-hidden rounded-3xl bg-card/80 backdrop-blur-xl border shadow-2xl p-6">
              {/* Decorative gradient orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
                    <QrCode className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Step 1: Scan QR Code</h3>
                    <p className="text-sm text-muted-foreground">Open your authenticator app and scan</p>
                  </div>
                </div>
                
                <div className="flex justify-center p-6 bg-muted/30 backdrop-blur-sm rounded-2xl border">
                  {qrCode ? (
                    <img src={`data:image/svg+xml;base64,${qrCode}`} alt="QR Code" className="w-72 h-72 rounded-xl" aria-label="Two-Factor Authentication QR Code" />
                  ) : (
                    <div className="w-72 h-72 flex items-center justify-center">
                      <div className="text-muted-foreground">Loading QR Code...</div>
                    </div>
                  )}
                </div>
                
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground font-medium">Can't scan? Enter this code manually:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="px-4 py-2 bg-muted backdrop-blur-sm border rounded-xl font-mono text-sm break-all shadow-inner">
                      {secret}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => copyToClipboard(secret)}
                      className="bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Recovery Codes - Enhanced Display */}
            <div className="relative overflow-hidden rounded-3xl bg-card/80 backdrop-blur-xl border shadow-2xl p-6">
              {/* Decorative gradient orbs */}
              <div className="absolute top-0 left-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Step 2: Save Recovery Codes</h3>
                    <p className="text-sm text-muted-foreground">Backup codes for emergency access</p>
                  </div>
                </div>
                
                <Alert className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700 dark:text-red-200">
                    <strong className="text-red-800 dark:text-red-100">Critical:</strong> Store these codes safely. Each code can only be used once. Without them, you may lose access to your account if you lose your phone.
                  </AlertDescription>
                </Alert>
                
                {recoveryCodes.length > 0 ? (
                  <>
                    <div className="bg-muted/30 backdrop-blur-sm border p-4 rounded-2xl" aria-label="Recovery Codes List">
                      <div className="grid grid-cols-2 gap-3">
                        {recoveryCodes.map((code, index) => (
                          <div 
                            key={index} 
                            className="group relative flex items-center justify-between bg-background/80 hover:bg-background transition-all p-3 rounded-xl border hover:border-yellow-500/50 shadow-lg"
                          >
                            <code className="font-mono text-base font-bold tracking-wider">
                              {code}
                            </code>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" 
                              onClick={() => copyToClipboard(code)}
                              aria-label={`Copy recovery code ${code}`}
                            >
                              <Copy className="h-3.5 w-3.5" />
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
                        variant="outline" 
                        onClick={downloadRecoveryCodes} 
                        className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download .txt
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center p-8 bg-muted/30 border border-dashed rounded-2xl">
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-muted-foreground">Recovery codes not loaded</p>
                      <p className="text-sm text-muted-foreground">Please wait or try again</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Verify Setup - With Visual Feedback */}
            <div className="relative overflow-hidden rounded-3xl bg-card/80 backdrop-blur-xl border shadow-2xl p-6">
              {/* Decorative gradient orbs */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Step 3: Verify Setup</h3>
                    <p className="text-sm text-muted-foreground">Enter the code from your authenticator app</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="verificationCode">6-Digit Verification Code</Label>
                  <div className="relative">
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setCodeValid(null); // Reset validation on change
                      }}
                      maxLength={6}
                      disabled={verifying}
                      className={`
                        text-center text-3xl font-mono tracking-[0.5em] h-16 
                        bg-background border-2 transition-all
                        ${codeValid === true ? 'border-green-500 ring-2 ring-green-500/20' : ''}
                        ${codeValid === false ? 'border-red-500 ring-2 ring-red-500/20 animate-shake' : ''}
                        ${codeValid === null && verificationCode.length === 6 ? 'border-yellow-500' : ''}
                      `}
                      aria-label="Enter 6-digit verification code"
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
                    <p className="text-sm text-red-500 dark:text-red-400 text-center animate-in fade-in">
                      Invalid code. Please check and try again.
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground text-center">
                    The code refreshes every 30 seconds
                  </p>
                </div>
                
                <Button 
                  onClick={handleVerifyAndActivate} 
                  disabled={verificationCode.length !== 6 || verifying}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg disabled:opacity-50"
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
                      Verify and Enable 2FA
                    </>
                  )}
                </Button>
              </div>
            </div>
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

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-6 py-6">
            {/* Animated success icon */}
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                2FA Enabled Successfully! 
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </h2>
              <p className="text-muted-foreground">
                Your account is now protected with two-factor authentication
              </p>
            </div>
            
            <div className="bg-muted/30 backdrop-blur-sm border rounded-2xl p-4 space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium">Recovery codes saved</p>
                  <p className="text-xs text-muted-foreground">Make sure you've stored them safely</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium">Authenticator app configured</p>
                  <p className="text-xs text-muted-foreground">You'll need it for future logins</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full h-12 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-semibold shadow-lg"
            >
              Got it, thanks!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
