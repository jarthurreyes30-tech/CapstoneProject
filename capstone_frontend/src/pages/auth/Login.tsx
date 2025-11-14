import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldAlert, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember_me: false,
    two_factor_code: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requires2FA, setRequires2FA] = useState(false);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const returnTo = searchParams.get('return_to');
      const result: any = await login(formData, returnTo);
      
      // Check if recovery code was used
      if (result?.used_recovery_code) {
        const remaining = result.remaining_recovery_codes || 0;
        
        toast.success('Login Successful', {
          description: result.warning || `You have ${remaining} recovery codes remaining.`,
          duration: 6000,
        });
        
        if (remaining <= 3) {
          toast.warning('Recovery Codes Running Low', {
            description: remaining === 0 
              ? 'Please generate new recovery codes immediately in your security settings.'
              : 'Consider generating new recovery codes in your security settings.',
            duration: 8000,
          });
        }
      } else {
        toast.success('Login successful!');
      }

    } catch (error: any) {
      // Check if 2FA is required
      if (error.response?.data?.requires_2fa) {
        setRequires2FA(true);
        toast.info('Two-Factor Authentication Required', {
          description: 'Please enter the code from your authenticator app',
        });
        setIsLoading(false);
        return;
      }

      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      setErrors({ general: errorMessage });
      toast.error('Login failed', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleRecoveryMode = () => {
    setUseRecoveryCode(!useRecoveryCode);
    setFormData(prev => ({ ...prev, two_factor_code: '' }));
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-8 px-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1.5 sm:mb-2">Welcome back</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Email */}
            {!requires2FA && (
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  autoComplete="email"
                  className={cn(errors.email && 'border-destructive', 'h-10 sm:h-11 text-sm')}
                />
              </div>
            )}

            {/* Password */}
            {!requires2FA && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                    autoComplete="current-password"
                    className={cn(errors.password && 'border-destructive', 'pr-10 h-10 sm:h-11 text-sm')}
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
            )}

            {/* Two-Factor Code / Recovery Code */}
            {requires2FA && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="two_factor_code" className="flex items-center gap-2">
                    {useRecoveryCode ? (
                      <>
                        <KeyRound className="h-4 w-4" />
                        Recovery Code
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4" />
                        Two-Factor Code
                      </>
                    )}
                  </Label>
                  
                  {useRecoveryCode ? (
                    <Input
                      id="two_factor_code"
                      type="text"
                      placeholder="XXXX-XXXX"
                      value={formData.two_factor_code}
                      onChange={(e) => handleChange('two_factor_code', e.target.value.toUpperCase())}
                      required
                      maxLength={9}
                      className={cn(
                        errors.two_factor_code && 'border-destructive',
                        'text-center text-xl font-mono tracking-wider'
                      )}
                      autoFocus
                    />
                  ) : (
                    <Input
                      id="two_factor_code"
                      type="text"
                      placeholder="000000"
                      value={formData.two_factor_code}
                      onChange={(e) => handleChange('two_factor_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      className={cn(
                        errors.two_factor_code && 'border-destructive',
                        'text-center text-xl sm:text-2xl font-mono tracking-widest'
                      )}
                      autoFocus
                    />
                  )}
                  
                  <p className="text-xs text-muted-foreground text-center">
                    {useRecoveryCode
                      ? 'Enter one of your backup recovery codes'
                      : 'Enter the 6-digit code from your authenticator app'}
                  </p>
                </div>

                {/* Toggle Recovery Code */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={toggleRecoveryMode}
                    className="text-sm text-primary hover:underline flex items-center gap-2 mx-auto"
                  >
                    {useRecoveryCode ? (
                      <>
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Use authenticator app instead
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-3.5 w-3.5" />
                        Can't access your app? Use a recovery code
                      </>
                    )}
                  </button>
                </div>

                {/* Info Alert */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {useRecoveryCode ? (
                      <>
                        <strong>Note:</strong> Each recovery code can only be used once. After using a code, 
                        consider generating new codes in your security settings.
                      </>
                    ) : (
                      <>
                        <strong>Tip:</strong> If you've lost access to your authenticator app, 
                        you can use one of your backup recovery codes instead.
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            {!requires2FA && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.remember_me}
                    onCheckedChange={(checked) =>
                      handleChange('remember_me', checked === true)
                    }
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>

                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-primary hover:underline self-start sm:self-auto"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
            
            {/* Divider and Socials */}
            {!requires2FA && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Button type="button" variant="outline" disabled className="h-10 sm:h-11 text-sm">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Google
                  </Button>
                  <Button type="button" variant="outline" disabled className="h-10 sm:h-11 text-sm">
                    <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    Facebook
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>

        {/* Resend Verification Link */}
        <p className="text-center mt-2 text-sm text-muted-foreground">
          Didn't receive verification email?{' '}
          <Link to="/auth/resend-verification" className="text-primary font-medium hover:underline">
            Resend verification link
          </Link>
        </p>
      </div>
    </div>
  );
}
