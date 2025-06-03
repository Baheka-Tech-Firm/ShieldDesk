import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { RiskScoreCard } from "@/components/dashboard/risk-score-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PopiaChecklist } from "@/components/dashboard/popia-checklist";
import { FileVaultPreview } from "@/components/dashboard/file-vault-preview";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { GlassCard } from "@/components/ui/glass-card";
import { CyberHUD } from "@/components/ui/cyber-hud";
import { Bell, Shield, Users, AlertTriangle, Activity, Zap, Database, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const riskAssessment = dashboardData?.riskAssessment;
  const files = dashboardData?.files || [];
  const popiaItems = dashboardData?.popiaItems || [];
  const activityLogs = dashboardData?.activityLogs || [];
  const notifications = dashboardData?.notifications || [];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
                <p className="text-gray-600 mt-1">Monitor your organization's cybersecurity posture</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-400 hover:text-gray-600">
                  <Bell className="w-6 h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Risk Score Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RiskScoreCard riskAssessment={riskAssessment} />
            
            {/* Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Encrypted Files</p>
                      <p className="text-xl font-semibold text-gray-900">{stats.encryptedFiles || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Active Users</p>
                      <p className="text-xl font-semibold text-gray-900">{stats.activeUsers || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Open Issues</p>
                      <p className="text-xl font-semibold text-gray-900">{stats.openIssues || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity and POPIA Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity activityLogs={activityLogs} />
            <PopiaChecklist items={popiaItems} />
          </div>

          {/* File Vault Preview */}
          <FileVaultPreview files={files} />
        </div>
      </main>
    </div>
  );
}
