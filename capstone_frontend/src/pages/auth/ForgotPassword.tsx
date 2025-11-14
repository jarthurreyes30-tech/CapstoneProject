import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setIsSuccess(true);
      setCountdown(60);
      setCanResend(false);
      toast.success('Verification code sent!', {
        description: response.message || 'Check your email for the 6-digit code.',
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error('Failed to send code', {
          description: err.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isLoading) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.resendResetCode(email);
      setCountdown(60);
      setCanResend(false);
      toast.success('Code resent!', {
        description: response.message || 'Check your email for the new code.',
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error('Failed to resend code', {
          description: err.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="w-full max-w-md">
          <div className="auth-card text-center space-y-5 sm:space-y-6">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold">Check your email</h2>
              <p className="text-muted-foreground">
                We've sent password reset instructions to
              </p>
              <p className="font-medium">{email}</p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Enter the 6-digit verification code from your email to reset your password. The code will expire in 15 minutes.
              </p>
              <p>
                Didn't receive the code? Check your spam folder or{' '}
                <button
                  onClick={handleResend}
                  disabled={!canResend || isLoading}
                  className={cn(
                    'text-primary hover:underline font-medium',
                    (!canResend || isLoading) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {!canResend ? `resend in ${countdown}s` : 'resend now'}
                </button>
              </p>
            </div>

            <Button 
              onClick={() => navigate(`/auth/reset-password?email=${encodeURIComponent(email)}`)} 
              className="w-full h-10 sm:h-11"
            >
              Enter Code
            </Button>

            <Link to="/auth/login">
              <Button variant="outline" className="w-full h-10 sm:h-11">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
            <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2">Forgot password?</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Form Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {error && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
                autoComplete="email"
                autoFocus
                className={cn(error && 'border-destructive')}
              />
            </div>

            <Button type="submit" className="w-full h-10 sm:h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send verification code
                </>
              )}
            </Button>

            <Link to="/auth/login">
              <Button variant="ghost" className="w-full h-10 sm:h-11" type="button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
