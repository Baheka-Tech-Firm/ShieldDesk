import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PopiaItem {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  completedBy?: number;
  completedAt?: string;
}

interface PopiaChecklistProps {
  items: PopiaItem[];
}

export function PopiaChecklist({ items }: PopiaChecklistProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const response = await apiRequest('PUT', `/api/popia/${id}`, { completed });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Success",
        description: "POPIA item updated successfully",
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

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>POPIA Compliance</CardTitle>
          <div className="text-sm text-gray-500">
            {completedCount} of {totalCount} items
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-4">
          <Progress value={progressPercent} className="w-full" />
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex items-start space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50"
              onClick={() => handleToggleItem(item.id, item.completed)}
            >
              <Checkbox 
                checked={item.completed}
                onChange={() => handleToggleItem(item.id, item.completed)}
                className="mt-1"
              />
              <div className="flex-1">
                <span className={`text-sm ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                  {item.title}
                </span>
                {item.description && (
                  <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button 
          className="mt-4 w-full" 
          disabled={completedCount === 0}
        >
          Generate Compliance Report
        </Button>
      </CardContent>
    </Card>
  );
}
