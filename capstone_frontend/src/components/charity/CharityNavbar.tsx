import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Heart, Moon, Sun, User, LogOut, Bell, Building2, FileText, Users, TrendingUp, Settings, ChevronDown, BarChart3, Upload, HelpCircle, Menu, X, Home, Newspaper, Target, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

export const CharityNavbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let timer: number | undefined;
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (!token) return;
        const res = await fetch(`${API_URL}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        setUnreadCount(data.count ?? data);
      } catch {
        // ignore polling errors
      }
    };
    fetchUnread();
    timer = window.setInterval(fetchUnread, 30000);
    return () => { if (timer) window.clearInterval(timer); };
  }, [API_URL]);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {/* Burger Menu Button - Mobile/Tablet */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer min-w-0" onClick={() => navigate('/charity')}>
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary fill-primary" />
              <span className="text-base sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate max-w-[40vw]">
                CharityHub
              </span>
            </div>
          </div>

          {/* Main Navigation - Desktop Only */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <NavLink
              to="/charity"
              end
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/charity/updates"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              Updates
            </NavLink>
            <NavLink
              to="/charity/campaigns"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              Campaigns
            </NavLink>
            <NavLink
              to="/charity/donations"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              Donations
            </NavLink>
            
            {/* Reports & Compliance Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground flex items-center gap-1">
                  Reports & Compliance
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-w-[90vw]">
                <DropdownMenuItem onClick={() => navigate('/charity/reports')} className="cursor-pointer">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Reports & Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/charity/documents')} className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Documents
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              onClick={() => {
                if (!user) { navigate('/auth/login'); return; }
                navigate('/charity/notifications');
              }}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-w-[90vw]">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || 'Charity Admin'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/charity/profile')} className="cursor-pointer">
                  <Building2 className="mr-2 h-4 w-4" />
                  Charity Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/charity/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/charity/help-center')} className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help Center
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile/Tablet Slide-in Menu */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-40 lg:hidden">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Slide-in Menu */}
        <div className="fixed inset-y-0 left-0 w-64 sm:w-72 bg-background border-r shadow-xl overflow-y-auto">
          <div className="p-4">
            {/* Menu Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary fill-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Menu
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              <NavLink
                to="/charity"
                end
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </NavLink>
              
              <NavLink
                to="/charity/updates"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <Newspaper className="h-5 w-5" />
                <span>Updates</span>
              </NavLink>
              
              <NavLink
                to="/charity/campaigns"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <Target className="h-5 w-5" />
                <span>Campaigns</span>
              </NavLink>
              
              <NavLink
                to="/charity/donations"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <DollarSign className="h-5 w-5" />
                <span>Donations</span>
              </NavLink>

              <div className="my-3 border-t" />
              
              {/* Reports & Compliance */}
              <div className="px-3 py-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reports & Compliance</p>
              </div>
              
              <NavLink
                to="/charity/reports"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <BarChart3 className="h-5 w-5" />
                <span>Reports & Analytics</span>
              </NavLink>
              
              <NavLink
                to="/charity/documents"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <Upload className="h-5 w-5" />
                <span>Documents</span>
              </NavLink>

              <div className="my-4 border-t" />

              {/* Account Section */}
              <NavLink
                to="/charity/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <Building2 className="h-5 w-5" />
                <span>Charity Profile</span>
              </NavLink>
              
              <NavLink
                to="/charity/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </NavLink>
              
              <NavLink
                to="/charity/help-center"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <HelpCircle className="h-5 w-5" />
                <span>Help Center</span>
              </NavLink>
            </nav>

            {/* User Info & Logout */}
            <div className="mt-6 pt-4 border-t">
              <div className="px-3 py-2 mb-2">
                <p className="text-sm font-medium">{user?.name || 'Charity Admin'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
