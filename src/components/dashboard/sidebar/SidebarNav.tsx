import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, MessageCircle, Bell, Video, User, Settings, LogOut, Plus, TrendingUp, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavItem {
  icon: any;
  label: string;
  path?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  premium?: boolean;
}

export const SidebarNav = ({ setIsCreatingPost }: { setIsCreatingPost: (value: boolean) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");
      
      // First clear all auth data from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key);
        }
      });
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // If we get a user_not_found error, that's fine - we want to log out anyway
      if (error) {
        console.log("Logout error:", error);
        if (error.message?.includes('user_not_found') || error.status === 403) {
          console.log("User already logged out or not found, proceeding with redirect");
          navigate("/auth");
          toast.success("Logged out successfully");
          return;
        }
        throw error;
      }
      
      console.log("Logout successful");
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, we want to force logout
      navigate("/auth");
      toast.error("There was an issue logging out, but you've been redirected to the login page");
    }
  };

  const navItems: NavItem[] = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/dashboard", 
      active: location.pathname === "/dashboard" 
    },
    { 
      icon: MessageCircle, 
      label: "Messages", 
      path: "/messages", 
      active: location.pathname === "/messages" 
    },
    { 
      icon: Bell, 
      label: "Notifications", 
      path: "/notifications", 
      active: location.pathname === "/notifications" 
    },
    { 
      icon: Video, 
      label: "Videos", 
      path: "/videos", 
      active: location.pathname === "/videos" 
    },
    { 
      icon: User, 
      label: "Profile", 
      path: "/profile",
      active: location.pathname === "/profile"
    },
    { icon: TrendingUp, label: "Analytics" },
    { 
      icon: DollarSign, 
      label: "Premium", 
      premium: true,
      className: "text-accent"
    },
    { 
      icon: Plus, 
      label: "Create Post",
      onClick: () => setIsCreatingPost(true),
      className: "border-2 border-white hover:bg-accent/90 text-white"
    },
    { icon: Settings, label: "Settings" },
    { 
      icon: LogOut, 
      label: "Logout", 
      onClick: handleLogout
    },
  ];

  const handleNavigation = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            onClick={() => handleNavigation(item)}
            className={cn(
              "w-full justify-start gap-4 hover:bg-accent hover:text-white transition-all",
              item.active && "bg-accent/10 text-accent",
              item.premium && "text-accent font-medium",
              item.className
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
            {item.premium && (
              <span className="ml-auto text-xs opacity-70">$8/mo</span>
            )}
          </Button>
        ))}
      </nav>
    </ScrollArea>
  );
};