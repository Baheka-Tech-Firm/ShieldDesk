import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const { data: popiaItems = [], isLoading } = useQuery({
    queryKey: ['/api/popia'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch('/api/popia', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch POPIA items');
      return response.json();
    },
    enabled: !!user,
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const response = await apiRequest('PUT', `/api/popia/${id}`, { completed });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/popia'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Updated",
        description: "POPIA compliance item updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update POPIA item",
        variant: "destructive",
      });
    },
  });

  const handleToggleItem = (id: number, completed: boolean) => {
    updateItemMutation.mutate({ id, completed: !completed });
  };

  const completedCount = popiaItems.filter(item => item.completed).length;
  const totalCount = popiaItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getComplianceLevel = (percent: number) => {
    if (percent >= 90) return { level: "Excellent", color: "text-green-600", bgColor: "bg-green-50" };
    if (percent >= 70) return { level: "Good", color: "text-blue-600", bgColor: "bg-blue-50" };
    if (percent >= 50) return { level: "Fair", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    return { level: "Needs Attention", color: "text-red-600", bgColor: "bg-red-50" };
  };

  const compliance = getComplianceLevel(progressPercent);

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

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">POPIA Compliance</h2>
                <p className="text-gray-600 mt-1">Monitor and manage your data protection compliance</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className={`${compliance.bgColor} ${compliance.color} border-0`}>
                  {compliance.level}
                </Badge>
                <span className="text-2xl font-bold text-gray-900">{progressPercent}%</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-xl font-semibold text-gray-900">{completedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Outstanding</p>
                    <p className="text-xl font-semibold text-gray-900">{totalCount - completedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Compliance</p>
                    <p className="text-xl font-semibold text-gray-900">{progressPercent}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Target</p>
                    <p className="text-xl font-semibold text-gray-900">100%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progressPercent} className="w-full h-3" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress: {completedCount} of {totalCount} items</span>
                  <span>{compliance.level}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Items */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>POPIA Compliance Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popiaItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleToggleItem(item.id, item.completed)}
                      >
                        <Checkbox 
                          checked={item.completed}
                          onChange={() => handleToggleItem(item.id, item.completed)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${item.completed ? 'text-gray-900' : 'text-gray-700'}`}>
                              {item.title}
                            </h4>
                            {item.completed ? (
                              <Badge variant="secondary" className="bg-green-50 text-green-700">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Complete
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          )}
                          {item.completedAt && (
                            <p className="text-xs text-gray-400 mt-2">
                              Completed on {new Date(item.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popiaItems.filter(item => !item.completed).map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleToggleItem(item.id, item.completed)}
                      >
                        <Checkbox 
                          checked={item.completed}
                          onChange={() => handleToggleItem(item.id, item.completed)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-700">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popiaItems.filter(item => item.completed).map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-start space-x-3 p-4 border rounded-lg bg-green-50"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          )}
                          {item.completedAt && (
                            <p className="text-xs text-gray-400 mt-2">
                              Completed on {new Date(item.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button disabled={completedCount === 0}>
              <Shield className="w-4 h-4 mr-2" />
              Generate Certificate
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}