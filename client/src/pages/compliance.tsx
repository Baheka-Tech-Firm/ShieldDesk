import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ThreeBackground from "@/components/ui/three-background";
import GlassMorphismCard from "@/components/ui/glass-morphism-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { GlassCard } from "@/components/ui/glass-card";
import { CyberHUD } from "@/components/ui/cyber-hud";
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Shield,
  Target,
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface PopiaItem {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  completedBy?: number;
  completedAt?: string;
}

export default function Compliance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const complianceRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  const { data: popiaItems = [], isLoading } = useQuery({
    queryKey: ['/api/popia'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch('/api/popia', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch POPIA items');
      }
      return response.json();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const token = getAuthToken();
      return apiRequest(`/api/popia/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/popia'] });
      toast({
        title: "Success",
        description: "Compliance item updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update compliance item",
        variant: "destructive",
      });
    },
  });

  const handleToggleItem = (id: number, currentStatus: boolean) => {
    updateMutation.mutate({ id, completed: !currentStatus });
  };

  const completedCount = popiaItems.filter((item: PopiaItem) => item.completed).length;
  const totalCount = popiaItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const pendingCount = totalCount - completedCount;

  const compliance = {
    level: progressPercent >= 90 ? "Excellent" : progressPercent >= 70 ? "Good" : progressPercent >= 50 ? "Fair" : "Poor",
    color: progressPercent >= 90 ? "text-green-700" : progressPercent >= 70 ? "text-blue-700" : progressPercent >= 50 ? "text-yellow-700" : "text-red-700",
    bgColor: progressPercent >= 90 ? "bg-green-50" : progressPercent >= 70 ? "bg-blue-50" : progressPercent >= 50 ? "bg-yellow-50" : "bg-red-50",
  };

  if (!user) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  useEffect(() => {
    if (!complianceRef.current || isLoading) return;

    gsap.fromTo(complianceRef.current, 
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
    );

    if (cardsRef.current.length > 0) {
      gsap.fromTo(cardsRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.3 }
      );
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      <AnimatedBackground />
      <div className="flex">
        <Sidebar />
        <main 
          ref={complianceRef}
          className="ml-64 pt-12 pl-6 pr-8 pb-8 relative z-10 min-h-screen overflow-y-auto bg-gradient-to-br from-black via-gray-900 to-red-950"
        >
        <GlassCard 
          variant="danger" 
          className="mb-6 glass-effect cyber-border"
          glowIntensity="medium"
          animated
        >
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Shield className="w-8 h-8 text-red-400" />
                  POPIA Compliance Center
                </h2>
                <p className="text-red-100/80 text-lg">
                  Monitor and manage your data protection compliance requirements
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <CyberHUD
                  title="COMPLIANCE"
                  value={`${progressPercent}%`}
                  subtitle="Complete"
                  status="success"
                  trend="up"
                  size="md"
                />
                <Badge className={`${compliance.bgColor} ${compliance.color} border-0 px-4 py-2 text-lg`}>
                  {compliance.level}
                </Badge>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassCard variant="danger" glowIntensity="low" animated className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-red-100/80">Completed</p>
                  <p className="text-2xl font-bold text-white">{completedCount}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard variant="danger" glowIntensity="low" animated className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-red-100/80">Outstanding</p>
                  <p className="text-2xl font-bold text-white">{totalCount - completedCount}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard variant="danger" glowIntensity="low" animated className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-red-100/80">Compliance</p>
                  <p className="text-2xl font-bold text-white">{progressPercent}%</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard variant="danger" glowIntensity="low" animated className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-red-100/80">Target</p>
                  <p className="text-2xl font-bold text-white">100%</p>
                </div>
              </div>
            </GlassCard>
          </div>

          <GlassCard variant="danger" glowIntensity="medium" animated className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Overall Progress</h3>
                <CyberHUD
                  title="STATUS"
                  value={`${progressPercent}%`}
                  subtitle={compliance.level}
                  status="critical"
                  trend="up"
                  size="sm"
                />
              </div>
              <div className="space-y-4">
                <Progress value={progressPercent} className="w-full h-4 bg-white/10" />
                <div className="flex justify-between text-sm text-red-100/80">
                  <span>Progress: {completedCount} of {totalCount} items</span>
                  <span className="text-red-300">{compliance.level}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="danger" glowIntensity="medium" animated className="overflow-hidden">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/10 border-0">
                <TabsTrigger value="all" className="data-[state=active]:bg-red-600 text-white">All Items</TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-red-600 text-white">Pending</TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-red-600 text-white">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4 p-6">
                <div className="space-y-2 mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-red-400" />
                    POPIA Compliance Checklist
                  </h3>
                  <p className="text-red-100/80">Complete all items to achieve full compliance</p>
                </div>
                <div className="space-y-4">
                  {popiaItems.map((item: PopiaItem) => (
                    <div 
                      key={item.id} 
                      className="flex items-start space-x-3 p-4 bg-white/10 border border-red-400/20 rounded-lg hover:bg-white/15 cursor-pointer transition-all duration-200"
                      onClick={() => handleToggleItem(item.id, item.completed)}
                    >
                      <Checkbox 
                        checked={item.completed}
                        onChange={() => handleToggleItem(item.id, item.completed)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${item.completed ? 'text-white' : 'text-red-100/80'}`}>
                            {item.title}
                          </h4>
                          {item.completed ? (
                            <Badge className="bg-red-600 text-white border-0">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-600 text-white border-0">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-cyan-100/60 mt-1">{item.description}</p>
                        )}
                        {item.completedAt && (
                          <p className="text-xs text-cyan-100/40 mt-2">
                            Completed on {new Date(item.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="space-y-4 p-6">
                <div className="space-y-4">
                  {popiaItems.filter((item: PopiaItem) => !item.completed).map((item: PopiaItem) => (
                    <div 
                      key={item.id} 
                      className="flex items-start space-x-3 p-4 bg-white/10 border border-orange-400/20 rounded-lg hover:bg-white/15 cursor-pointer transition-all duration-200"
                      onClick={() => handleToggleItem(item.id, item.completed)}
                    >
                      <Checkbox 
                        checked={item.completed}
                        onChange={() => handleToggleItem(item.id, item.completed)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-orange-100/80">{item.title}</h4>
                          <Badge className="bg-orange-600 text-white border-0">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-orange-100/60 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="space-y-4 p-6">
                <div className="space-y-4">
                  {popiaItems.filter((item: PopiaItem) => item.completed).map((item: PopiaItem) => (
                    <div 
                      key={item.id} 
                      className="flex items-start space-x-3 p-4 bg-white/10 border border-green-400/20 rounded-lg hover:bg-white/15 cursor-pointer transition-all duration-200"
                      onClick={() => handleToggleItem(item.id, item.completed)}
                    >
                      <Checkbox 
                        checked={item.completed}
                        onChange={() => handleToggleItem(item.id, item.completed)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white">{item.title}</h4>
                          <Badge className="bg-green-600 text-white border-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Complete
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-green-100/60 mt-1">{item.description}</p>
                        )}
                        {item.completedAt && (
                          <p className="text-xs text-green-100/40 mt-2">
                            Completed on {new Date(item.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </GlassCard>
        </div>
        </main>
      </div>
    </div>
  );
}