import React from "react";
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
    <aside className="w-64 h-screen flex-shrink-0 fixed left-0 top-0 z-40">
      <div className="h-full bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50">
        <div className="flex flex-col h-full">
          {/* Logo and Company */}
          <div className="p-8 border-b border-gray-700/50">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/25">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">ShieldDesk</h1>
                <p className="text-sm text-gray-300 font-medium mt-1">{company.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-400 font-semibold tracking-wide">SECURE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-6 space-y-3">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center space-x-4 px-4 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer group ${
                    isActive(item.href) 
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/25 scale-[1.02]" 
                      : "text-gray-300 hover:bg-gray-800/70 hover:text-white hover:scale-[1.01]"
                  }`}>
                    <Icon className={`w-6 h-6 transition-transform duration-300 ${
                      isActive(item.href) ? "" : "group-hover:scale-110"
                    }`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-6 border-t border-gray-700/50">
            <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize font-medium">{user.role}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}