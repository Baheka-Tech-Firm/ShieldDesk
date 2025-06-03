import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: number;
  action: string;
  resource: string;
  createdAt: string;
  details?: any;
}

interface RecentActivityProps {
  activityLogs: ActivityLog[];
}

export function RecentActivity({ activityLogs }: RecentActivityProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "upload":
        return <Upload className="w-4 h-4 text-primary" />;
      case "download":
        return <Download className="w-4 h-4 text-yellow-600" />;
      case "delete":
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return <Upload className="w-4 h-4 text-primary" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "upload":
        return <Badge variant="secondary" className="bg-green-50 text-green-700">Uploaded</Badge>;
      case "download":
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700">Downloaded</Badge>;
      case "delete":
        return <Badge variant="secondary" className="bg-red-50 text-red-700">Deleted</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent File Activity</CardTitle>
          <Button variant="link" className="p-0 text-primary">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityLogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            activityLogs.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  {getActionIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.resource}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {getActionBadge(activity.action)}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
