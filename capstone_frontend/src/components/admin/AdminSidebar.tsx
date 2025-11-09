import { LayoutDashboard, Users, Building2, FileText, Settings, AlertTriangle, Activity, TrendingUp, Heart, Mail } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Charities", url: "/admin/charities", icon: Building2 },
  { title: "Fund Tracking", url: "/admin/fund-tracking", icon: TrendingUp },
  { title: "Reports", url: "/admin/reports", icon: AlertTriangle },
  { title: "Action Logs", url: "/admin/action-logs", icon: Activity },
  { title: "Test Email", url: "/admin/test-email", icon: Mail },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export const AdminSidebar = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="w-64">
      <SidebarContent>
        <SidebarGroup>
          <div className={`py-6 ${isCollapsed ? 'px-0' : 'px-4'}`}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-2'}`}
            >
              <Heart className="h-8 w-8 text-primary fill-primary flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent whitespace-nowrap">
                  CharityHub
                </span>
              )}
            </motion.div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className={`space-y-1 ${isCollapsed ? 'px-0' : 'px-4'}`}>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    to={item.url}
                    end={item.url === "/admin"}
                    className={({ isActive }) =>
                      `flex items-center w-full ${isCollapsed ? 'justify-center px-3 py-3.5' : 'gap-3.5 px-5 py-3.5'} rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium border-l-4 border-primary"
                          : "text-sidebar-foreground hover:bg-muted/50 hover:text-foreground"
                      }`
                    }
                  >
                    <item.icon className={`${isCollapsed ? "h-5 w-5" : "h-5 w-5"} flex-shrink-0`} />
                    {!isCollapsed && <span className="text-base font-medium">{item.title}</span>}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
