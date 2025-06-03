import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { 
  Shield, 
  LayoutDashboard, 
  FolderLock, 
  CheckCircle, 
  Users, 
  Settings,
  LogOut,
  Search,
  AlertTriangle,
  FileText,
  Bug,
  Monitor,
  Eye,
  Building2
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { user, company, logout } = useAuth();

  if (!user || !company) return null;

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "compliance", "it", "employee"]
    },
    {
      name: "File Vault",
      href: "/files",
      icon: FolderLock,
      roles: ["admin", "compliance", "it", "employee"]
    },
    {
      name: "Vulnerability Scanner",
      href: "/vulnerability-scanner",
      icon: Bug,
      roles: ["admin", "compliance", "it"]
    },
    {
      name: "Threat Intelligence",
      href: "/threat-intelligence",
      icon: AlertTriangle,
      roles: ["admin", "compliance", "it"]
    },
    {
      name: "Security Monitoring",
      href: "/security-monitoring",
      icon: Monitor,
      roles: ["admin", "compliance", "it"]
    },
    {
      name: "Incident Response",
      href: "/incident-response",
      icon: Eye,
      roles: ["admin", "compliance", "it"]
    },
    {
      name: "Compliance",
      href: "/compliance",
      icon: CheckCircle,
      roles: ["admin", "compliance", "it"]
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
      roles: ["admin", "compliance", "it"]
    },
    {
      name: "User Management",
      href: "/users",
      icon: Users,
      roles: ["admin", "compliance"]
    },
    {
      name: "Admin Panel",
      href: "/admin",
      icon: Building2,
      roles: ["admin"]
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  );

  const isActive = (href: string) => location === href;

  return (
    <aside className="w-72 flex flex-col h-screen flex-shrink-0">
      <GlassCard 
        variant="danger" 
        className="m-4 h-full glass-effect"
        glowIntensity="low"
        animated
      >
        <div className="flex flex-col h-full">
          {/* Logo and Company */}
          <div className="p-6 border-b border-red-400/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">ShieldDesk</h1>
                <p className="text-sm text-red-100/80 font-medium">{company.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-400 font-medium">SECURE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                    isActive(item.href) 
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                      : "text-red-100/80 hover:bg-white/10 hover:text-white"
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-red-400/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-red-100/80 capitalize">{user.role}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
                className="text-red-100/80 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </aside>
  );
}