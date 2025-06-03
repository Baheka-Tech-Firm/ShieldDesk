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
  const dashboardRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

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

  useEffect(() => {
    if (!dashboardRef.current || isLoading) return;

    // Animate dashboard entrance
    gsap.fromTo(dashboardRef.current, 
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
    );

    // Staggered animation for cards
    if (cardsRef.current.length > 0) {
      gsap.fromTo(cardsRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.3 }
      );
    }
  }, [isLoading]);

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-red-950">
      <AnimatedBackground />
      <div className="flex">
        <Sidebar />
        <main 
          ref={dashboardRef}
          className="flex-1 ml-0 md:ml-72 min-h-screen overflow-y-auto relative z-10"
        >
        {/* Immersive Header with Glass Effect */}
        <GlassCard 
          variant="danger" 
          className="m-6 mb-0 glass-effect cyber-border"
          glowIntensity="medium"
          animated
        >
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Shield className="w-8 h-8 text-red-400" />
                  Security Command Center
                </h2>
                <p className="text-red-100/80 text-lg">
                  Real-time cybersecurity intelligence & threat monitoring
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-400 animate-pulse" />
                  <span className="text-green-400 font-medium">System Operational</span>
                </div>
                <button className="relative p-3 text-cyan-400 hover:text-cyan-300 transition-colors">
                  <Bell className="w-6 h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Enhanced Dashboard Content */}
        <div className="p-6 space-y-8">
          {/* Immersive Stats Grid */}
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            ref={(el) => {
              if (el && !cardsRef.current.includes(el)) {
                cardsRef.current.push(el);
              }
            }}
          >
            {/* Risk Score HUD */}
            <div 
              className="lg:col-span-2"
              ref={(el) => {
                if (el && !cardsRef.current.includes(el)) {
                  cardsRef.current.push(el);
                }
              }}
            >
              <RiskScoreCard riskAssessment={riskAssessment} />
            </div>
            
            {/* Cyber Stats HUDs */}
            <div 
              className="space-y-4"
              ref={(el) => {
                if (el && !cardsRef.current.includes(el)) {
                  cardsRef.current.push(el);
                }
              }}
            >
              <CyberHUD
                title="SECURE FILES"
                value={stats.encryptedFiles || 0}
                subtitle="Encrypted & Protected"
                status="success"
                trend="stable"
                animated
                size="md"
              />
              
              <CyberHUD
                title="ACTIVE USERS"
                value={stats.activeUsers || 0}
                subtitle="Current Sessions"
                status="normal"
                trend="up"
                animated
                size="md"
              />
            </div>

            <div 
              className="space-y-4"
              ref={(el) => {
                if (el && !cardsRef.current.includes(el)) {
                  cardsRef.current.push(el);
                }
              }}
            >
              <CyberHUD
                title="THREAT LEVEL"
                value={stats.openIssues || 0}
                subtitle="Active Alerts"
                status={stats.openIssues > 0 ? "warning" : "success"}
                trend={stats.openIssues > 0 ? "up" : "stable"}
                animated
                size="md"
              />
              
              <CyberHUD
                title="SYSTEM STATUS"
                value="98.7%"
                subtitle="Uptime"
                status="success"
                trend="stable"
                animated
                size="md"
              />
            </div>
          </div>

          {/* Advanced Security Metrics */}
          <div 
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            ref={(el) => {
              if (el && !cardsRef.current.includes(el)) {
                cardsRef.current.push(el);
              }
            }}
          >
            <GlassCard variant="security" glowIntensity="low" animated className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-400 text-sm font-medium">FIREWALL</p>
                  <p className="text-white text-2xl font-bold">ACTIVE</p>
                </div>
                <Shield className="w-8 h-8 text-green-400" />
              </div>
            </GlassCard>

            <GlassCard variant="warning" glowIntensity="low" animated className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-400 text-sm font-medium">SCANNING</p>
                  <p className="text-white text-2xl font-bold">24/7</p>
                </div>
                <Activity className="w-8 h-8 text-orange-400 animate-pulse" />
              </div>
            </GlassCard>

            <GlassCard variant="success" glowIntensity="low" animated className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">ENCRYPTED</p>
                  <p className="text-white text-2xl font-bold">256-BIT</p>
                </div>
                <Lock className="w-8 h-8 text-green-400" />
              </div>
            </GlassCard>

            <GlassCard variant="security" glowIntensity="low" animated className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-400 text-sm font-medium">DATABASE</p>
                  <p className="text-white text-2xl font-bold">SECURE</p>
                </div>
                <Database className="w-8 h-8 text-cyan-400" />
              </div>
            </GlassCard>
          </div>

          {/* Enhanced Activity & Compliance Section */}
          <div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            ref={(el) => {
              if (el && !cardsRef.current.includes(el)) {
                cardsRef.current.push(el);
              }
            }}
          >
            <GlassCard variant="security" glowIntensity="medium" animated className="overflow-hidden">
              <RecentActivity activityLogs={activityLogs} />
            </GlassCard>
            
            <GlassCard variant="success" glowIntensity="medium" animated className="overflow-hidden">
              <PopiaChecklist items={popiaItems} />
            </GlassCard>
          </div>

          {/* Immersive File Vault Preview */}
          <div 
            ref={(el) => {
              if (el && !cardsRef.current.includes(el)) {
                cardsRef.current.push(el);
              }
            }}
          >
            <GlassCard variant="security" glowIntensity="high" animated className="overflow-hidden">
              <FileVaultPreview files={files} />
            </GlassCard>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
