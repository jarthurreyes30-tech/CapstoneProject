import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Loader2, CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [email, setEmail] = useState(emailParam || '');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [remainingResends, setRemainingResends] = useState(3);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-verify with token if present
  useEffect(() => {
    if (token && email) {
      verifyWithToken();
    } else if (emailParam) {
      // Set expiry 5 minutes from now (changed from 15)
      setExpiresAt(new Date(Date.now() + 5 * 60 * 1000));
    }
  }, [token, email]);

  // Countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Expiry countdown
  useEffect(() => {
    if (expiresAt) {
      const updateTimer = () => {
        const remaining = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
        setTimeRemaining(remaining > 0 ? remaining : 0);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [expiresAt]);

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
    if (newCode.every(digit => digit) && !isVerifying) {
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
      toast.error('Please enter all 6 digits');
      return;
    }

    if (!email) {
      toast.error('Email address is required');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const response = await api.post('/auth/verify-email-code', {
        email,
        code: verificationCode,
      });

      setStatus('success');
      toast.success('Email verified!', {
        description: 'Your account has been successfully verified.',
      });

      // Redirect after delay
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);

    } catch (error: any) {
      setStatus('error');
      const message = error.response?.data?.message || 'Verification failed';
      setErrorMessage(message);

      if (error.response?.data?.max_attempts) {
        toast.error('Maximum attempts reached', {
          description: 'Please request a new verification code.',
        });
        setRemainingAttempts(0);
      } else if (error.response?.data?.expired) {
        toast.error('Code expired', {
          description: 'Please request a new verification code.',
        });
      } else {
        const attempts = error.response?.data?.remaining_attempts;
        if (attempts !== undefined) {
          setRemainingAttempts(attempts);
        }
        toast.error('Invalid code', {
          description: message,
        });
      }

      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

    } finally {
      setIsVerifying(false);
    }
  };

  const verifyWithToken = async () => {
    if (!token || !email) return;

    setStatus('verifying');
    try {
      const response = await api.get('/auth/verify-email-token', {
        params: { token, email }
      });

      setStatus('success');
      toast.success('Email verified!', {
        description: 'Your account has been successfully verified.',
      });

      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);

    } catch (error: any) {
      setStatus('error');
      const message = error.response?.data?.message || 'Verification link is invalid or expired';
      setErrorMessage(message);
      toast.error('Verification failed', {
        description: message,
      });
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0 || remainingResends <= 0) return;

    setIsResending(true);
    try {
      const response = await api.post('/auth/resend-verification-code', { email });

      toast.success('Code sent!', {
        description: 'A new verification code has been sent to your email.',
      });

      setResendCooldown(60);
      setRemainingResends(response.data.remaining_resends);
      setRemainingAttempts(5); // Reset attempts
      setCode(['', '', '', '', '', '']);
      setStatus('pending');
      setErrorMessage('');
      
      // Update expiry (should be 5 minutes)
      if (response.data.expires_in) {
        setExpiresAt(new Date(Date.now() + response.data.expires_in * 60 * 1000));
      } else {
        setExpiresAt(new Date(Date.now() + 5 * 60 * 1000));
      }

      inputRefs.current[0]?.focus();

    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend code';
      toast.error('Resend failed', {
        description: message,
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
            <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2">Verify Your Email</h1>
          <p className="text-muted-foreground">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        <div className="auth-card space-y-5 sm:space-y-6">
          {/* Success State */}
          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold">Email Verified!</h2>
                <p className="text-muted-foreground">
                  Your account has been successfully verified.
                </p>
              </div>
              <Button onClick={() => navigate('/auth/login')} className="w-full h-11 sm:h-12" size="lg">
                Continue to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Verifying with token */}
          {status === 'verifying' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {/* Code Input (Pending or Error) */}
          {(status === 'pending' || status === 'error') && !token && (
            <>
              {/* Code Input Fields */}
              <div className="space-y-4">
                <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
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
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold"
                      autoFocus={index === 0}
                      disabled={isVerifying}
                    />
                  ))}
                </div>

                {/* Error Message */}
                {errorMessage && status === 'error' && (
                  <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-center">
                    {errorMessage}
                  </div>
                )}

                {/* Attempts Remaining */}
                {remainingAttempts < 5 && remainingAttempts > 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    {remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining
                  </p>
                )}

                {/* Expiry Timer */}
                {timeRemaining !== null && timeRemaining > 0 && (
                  <div className="text-center text-sm text-muted-foreground">
                    Code expires in <strong>{formatTime(timeRemaining)}</strong>
                  </div>
                )}

                {timeRemaining === 0 && (
                  <div className="text-center text-sm text-destructive">
                    Code has expired. Please request a new one.
                  </div>
                )}

                {/* Verify Button */}
                <Button
                  onClick={() => handleVerifyCode()}
                  disabled={code.some(d => !d) || isVerifying}
                  className="w-full h-11 sm:h-12"
                  size="lg"
                >
                  {isVerifying ? (
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
                  disabled={isResending || resendCooldown > 0 || remainingResends <= 0}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Code ({remainingResends} left)
                    </>
                  )}
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  Check your spam folder if you don't see the email
                </p>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
