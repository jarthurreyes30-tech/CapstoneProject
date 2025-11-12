import { Link } from 'react-router-dom';
import { Users, Building2, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-3 sm:p-4 lg:p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10 lg:mb-12 px-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">Join our community</h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            Choose how you'd like to make a difference
          </p>
        </div>

        {/* Registration Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Donor Card */}
          <Link to="/auth/register/donor" className="group block">
            <div className="auth-card h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer border-2 hover:border-primary">
              <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold">Register as Donor</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Support meaningful causes and make a direct impact in your community
                  </p>
                </div>

                <ul className="text-sm text-left space-y-2 w-full">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Secure donation processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Track your giving impact</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Optional anonymous giving</span>
                  </li>
                </ul>

                <Button className="w-full h-11 sm:h-12 text-base" size="lg">
                  Continue as Donor
                </Button>
              </div>
            </div>
          </Link>

          {/* Charity Card */}
          <Link to="/auth/register/charity" className="group block">
            <div className="auth-card h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer border-2 hover:border-secondary">
              <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-secondary" />
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold">Register as Charity</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Connect with donors and grow your organization's reach
                  </p>
                </div>

                <ul className="text-sm text-left space-y-2 w-full">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Verified organization profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Donor management tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Campaign creation & tracking</span>
                  </li>
                </ul>

                <Button variant="secondary" className="w-full h-11 sm:h-12 text-base" size="lg">
                  Continue as Charity
                </Button>
              </div>
            </div>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-3 sm:space-y-4 px-2">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Join over 10,000+ members making a difference</span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
