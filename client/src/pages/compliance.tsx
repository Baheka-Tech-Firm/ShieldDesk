import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText } from "lucide-react";
import { gsap } from "gsap";
import GlassCard from "@/components/ui/glass-card";
import AnimatedBackground from "@/components/ui/animated-background";
import { apiRequest } from "@/lib/queryClient";

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
  const complianceRef = useRef<HTMLMainElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const queryClient = useQueryClient();

  const { data: popiaItems = [], isLoading } = useQuery({
    queryKey: ['/api/compliance/popia'],
    queryFn: () => [
      { id: 1, title: "Data Protection Policy", description: "Establish comprehensive data protection policies", completed: true, completedAt: "2024-05-15T10:30:00Z" },
      { id: 2, title: "Privacy Impact Assessment", description: "Conduct privacy impact assessments for new systems", completed: true, completedAt: "2024-05-20T14:15:00Z" },
      { id: 3, title: "Data Subject Rights Procedures", description: "Implement procedures for handling data subject requests", completed: false },
      { id: 4, title: "Data Breach Response Plan", description: "Develop and test data breach response procedures", completed: false },
      { id: 5, title: "Third-Party Data Sharing Agreements", description: "Review and update all third-party data sharing agreements", completed: true, completedAt: "2024-06-01T09:45:00Z" },
      { id: 6, title: "Employee Training Program", description: "Implement comprehensive POPIA training for all employees", completed: false },
      { id: 7, title: "Data Retention Schedule", description: "Establish clear data retention and deletion schedules", completed: false },
      { id: 8, title: "Regular Compliance Audits", description: "Schedule and conduct regular compliance audits", completed: false }
    ]
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) => 
      apiRequest(`/api/compliance/popia/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ completed })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/compliance/popia'] });
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
      { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }
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
      <Sidebar />
      <main 
        ref={complianceRef}
        className="ml-64 pt-12 pl-6 pr-8 pb-8 relative z-50 min-h-screen overflow-y-auto bg-gradient-to-br from-black via-gray-900 to-red-950"
      >
        <GlassCard 
          variant="danger" 
          className="mb-6 glass-effect cyber-border"
          glowIntensity="medium"
          animated
        >
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">POPIA Compliance Dashboard</h1>
                <p className="text-gray-300">Protection of Personal Information Act compliance tracking</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className={`${compliance.bgColor} ${compliance.color} border-0 px-4 py-2 text-sm font-semibold`}>
                  {compliance.level} ({progressPercent}%)
                </Badge>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{completedCount}/{totalCount}</div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Completed Items</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{completedCount}</div>
                  <Progress value={progressPercent} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Pending Items</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
                  <p className="text-xs text-gray-500 mt-2">Requires attention</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Compliance Score</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{progressPercent}%</div>
                  <p className="text-xs text-gray-500 mt-2">{compliance.level} compliance</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
                <TabsTrigger value="all" className="data-[state=active]:bg-red-600">All Items</TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-red-600">Pending</TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-red-600">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {popiaItems.map((item: PopiaItem) => (
                    <div key={item.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleToggleItem(item.id, item.completed)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h3 className={`font-medium ${item.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                          )}
                          {item.completedAt && (
                            <p className="text-xs text-green-100/40 mt-2">
                              Completed on {new Date(item.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.completed ? (
                            <Badge className="bg-green-600 text-white">Complete</Badge>
                          ) : (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-400">Pending</Badge>
                          )}
                          <FileText className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                <div className="space-y-4">
                  {popiaItems.filter((item: PopiaItem) => !item.completed).map((item: PopiaItem) => (
                    <div key={item.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleToggleItem(item.id, item.completed)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{item.title}</h3>
                          {item.description && (
                            <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="border-yellow-500 text-yellow-400">Pending</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="space-y-4">
                  {popiaItems.filter((item: PopiaItem) => item.completed).map((item: PopiaItem) => (
                    <div key={item.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleToggleItem(item.id, item.completed)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-green-400 line-through">{item.title}</h3>
                          {item.description && (
                            <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                          )}
                          {item.completedAt && (
                            <p className="text-xs text-green-100/40 mt-2">
                              Completed on {new Date(item.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-green-600 text-white">Complete</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}