import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, QrCode, Key, CheckCircle, AlertTriangle, Copy, Lock, Download, ArrowRight, ArrowLeft } from "lucide-react";
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
    const blob = new Blob([`CharityHub 2FA Recovery Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${text}\n\n⚠️ Keep these codes safe! You'll need them if you lose access to your authenticator app.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `charityhub-recovery-codes-${Date.now()}.txt`;
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

  const handleCloseSetup = () => {
    setShowSetupModal(false);
    setSetupStep(1);
    setVerificationCode("");
    setCodeValid(null);
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
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
          <div className={`p-4 rounded-lg border-2 ${is2FAEnabled ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${is2FAEnabled ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-200 dark:bg-gray-800'}`}>
                  {is2FAEnabled ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
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
                        onClick={() => copyToClipboard(secret)}
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
                    <strong>Success!</strong> Two-factor authentication is now enabled.
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
                              onClick={() => copyToClipboard(code)}
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
    </div>
  );
}
