import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, ArrowLeft, CheckCircle, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function ChangeEmail() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newEmailConfirmation, setNewEmailConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newEmail !== newEmailConfirmation) {
      toast({
        title: "Error",
        description: "Email addresses do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/me/change-email", {
        current_password: currentPassword,
        new_email: newEmail,
        new_email_confirmation: newEmailConfirmation,
      });

      setShowVerification(true);
      toast({
        title: "Code Sent",
        description: response.data.message,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (showVerification && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showVerification, timeRemaining]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newCode.every(digit => digit) && !verifying) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('');
    setCode([...newCode, ...Array(6 - newCode.length).fill('')]);
    
    if (newCode.length === 6) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleVerifyCode = async (codeString?: string) => {
    const verificationCode = codeString || code.join('');

    if (verificationCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter all 6 digits",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);

    try {
      const response = await api.post("/me/verify-email-change-code", {
        code: verificationCode,
      });

      setSuccess(true);
      toast({
        title: "Success",
        description: response.data.message,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Invalid verification code",
        variant: "destructive",
      });
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendCooldown(60);
    setLoading(true);

    try {
      const response = await api.post("/me/change-email", {
        current_password: currentPassword,
        new_email: newEmail,
        new_email_confirmation: newEmailConfirmation,
      });

      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email",
      });
      
      setTimeRemaining(300); // Reset timer to 5 minutes
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to resend code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Verification Code Screen
  if (showVerification && !success) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowVerification(false)}
            className="mb-4 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card className="border shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
              <CardDescription>
                We sent a 6-digit code to <strong>{newEmail}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Code Input Fields */}
              <div className="space-y-4">
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold"
                      autoFocus={index === 0}
                      disabled={verifying}
                    />
                  ))}
                </div>

                {/* Timer */}
                {timeRemaining > 0 ? (
                  <div className="text-center text-sm text-muted-foreground">
                    Code expires in <strong className="text-foreground">{formatTime(timeRemaining)}</strong>
                  </div>
                ) : (
                  <div className="text-center text-sm text-destructive">
                    Code has expired. Please request a new one.
                  </div>
                )}

                {/* Verify Button */}
                <Button
                  onClick={() => handleVerifyCode()}
                  disabled={code.some(d => !d) || verifying}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg h-11"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </Button>
              </div>

              {/* Resend Section */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm text-center text-muted-foreground">
                  Didn't receive the code?
                </p>
                <Button
                  onClick={handleResend}
                  disabled={loading || resendCooldown > 0}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Code
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Check your spam folder if you don't see the email
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success Screen
  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        <Card className="border shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400 relative z-10" />
            </div>
            <CardTitle className="text-2xl font-bold">Email Updated!</CardTitle>
            <CardDescription className="text-sm">
              Your email address has been successfully changed
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">New email address:</p>
                <p className="text-green-600 dark:text-green-400 font-mono text-xs break-all">{newEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-medium">Next Steps:</p>
                <p>• Use your new email for login</p>
                <p>• Update email in other services</p>
                <p>• Keep your account secure</p>
              </div>
            </div>

            <Button 
              onClick={() => navigate("/donor/settings")} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg"
            >
              Back to Settings
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/donor/settings")}
          className="mb-3 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>

        {/* Main Card */}
        <Card className="border shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Change Email Address</CardTitle>
            <CardDescription className="text-sm">
              Update your login email with security verification
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* New Email */}
              <div className="space-y-2">
                <Label htmlFor="newEmail" className="text-sm font-medium">
                  New Email Address
                </Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="new@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* Confirm Email */}
              <div className="space-y-2">
                <Label htmlFor="newEmailConfirmation" className="text-sm font-medium">
                  Confirm New Email
                </Label>
                <Input
                  id="newEmailConfirmation"
                  type="email"
                  placeholder="new@email.com"
                  value={newEmailConfirmation}
                  onChange={(e) => setNewEmailConfirmation(e.target.value)}
                  required
                  className="h-11"
                />
                {newEmail && newEmailConfirmation && newEmail !== newEmailConfirmation && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    Emails do not match
                  </p>
                )}
              </div>


              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg h-12 text-base"
                disabled={loading || (newEmail && newEmailConfirmation && newEmail !== newEmailConfirmation)}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending Code...
                  </>
                ) : (
                  "Change Email Address"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
