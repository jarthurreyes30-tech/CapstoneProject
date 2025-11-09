import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, User, LoginCredentials } from '@/services/auth';
import { Loader2 } from 'lucide-react';

// Define the shape of the context data
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials, returnTo?: string | null) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated on mount
    const checkSession = async () => {
      const token = authService.getToken();
      console.log('🔑 Checking session, token exists:', !!token);
      if (token) {
        try {
          console.log('🔄 Fetching current user...');
          // Fetch current user from backend
          const currentUser = await authService.getCurrentUser();
          console.log('✅ Session valid, user:', currentUser);
          setUser(currentUser);
        } catch (error: any) {
          console.error('❌ Session check failed:', error?.response?.status, error?.message);
          // Clear invalid token
          authService.clearToken();
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const login = async (credentials: LoginCredentials, returnTo?: string | null) => {
    try {
      const response = await authService.login(credentials);
      const loggedInUser = response.user;
      setUser(loggedInUser);

      // --- RBAC REDIRECTION LOGIC ---
      let redirectPath = returnTo || '/';

      if (!returnTo) {
          switch (loggedInUser.role) {
            case 'admin':
              redirectPath = '/admin';
              break;
            case 'charity_admin':
              redirectPath = '/charity';
              break;
            case 'donor':
              redirectPath = '/donor';
              break;
            default:
              redirectPath = '/';
          }
      }
      
      navigate(redirectPath, { replace: true });
      
      // Return full response for recovery code warnings
      return response;

    } catch (error: any) {
      // Don't log 2FA required errors (they're expected and handled)
      if (!error.response?.data?.requires_2fa) {
        console.error("Login failed:", error);
      }
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/auth/login');
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};