import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  LayoutDashboard, 
  FolderLock, 
  CheckCircle, 
  Users, 
  Settings,
  LogOut 
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
      name: "Compliance",
      href: "/compliance",
      icon: CheckCircle,
      roles: ["admin", "compliance", "it", "employee"]
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
      icon: Settings,
      roles: ["admin"]
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  );

  const isActive = (href: string) => location === href;

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo and Company */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ShieldDesk</h1>
            <p className="text-sm text-gray-500">{company.name}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                isActive(item.href) 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}>
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {user.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={logout}
            className="text-gray-400 hover:text-gray-600"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
