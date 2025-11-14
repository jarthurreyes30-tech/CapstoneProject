import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { authService } from '@/services/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  if (!emailFromUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="w-full max-w-md auth-card text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Email Required</h2>
          <p className="text-muted-foreground">
            Please request a password reset code first.
          </p>
          <Link to="/auth/forgot-password">
            <Button>Request reset code</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setRemainingAttempts(null);

    // Validate form
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!code || code.length !== 6) {
      setErrors({ code: 'Please enter the 6-digit code' });
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(email, code, formData.password, formData.confirmPassword);
      setIsSuccess(true);
      toast.success('Password reset successful!', {
        description: 'You can now sign in with your new password.',
      });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      
      // Check for remaining attempts in error
      if (error.response?.data?.remaining_attempts !== undefined) {
        setRemainingAttempts(error.response.data.remaining_attempts);
      }
      
      setErrors({ general: errorMessage });
      toast.error('Failed to reset password', {
        description: errorMessage,
      });
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
              <h2 className="text-xl sm:text-2xl font-bold">Password reset successful</h2>
              <p className="text-muted-foreground">
                Your password has been successfully reset
              </p>
            </div>

            <Button onClick={() => navigate('/auth/login')} className="w-full h-10 sm:h-11">
              Continue to login
            </Button>
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2">Reset your password</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code from your email and your new password
          </p>
        </div>

        {/* Form Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {errors.general && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
                <div>{errors.general}</div>
                {remainingAttempts !== null && remainingAttempts > 0 && (
                  <div className="mt-2 text-xs">
                    {remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining
                  </div>
                )}
              </div>
            )}

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>

            {/* Verification Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                  setErrors({ ...errors, code: '' });
                }}
                required
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
                className={cn(
                  'text-center text-2xl tracking-widest font-mono',
                  errors.code && 'border-destructive'
                )}
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength */}
            <PasswordStrengthMeter password={formData.password} />

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  autoComplete="new-password"
                  className={cn(
                    errors.confirmPassword && 'border-destructive',
                    'pr-10'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-10 sm:h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                'Reset password'
              )}
            </Button>

            <Link to="/auth/login">
              <Button variant="ghost" className="w-full h-10 sm:h-11" type="button">
                Back to login
              </Button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
