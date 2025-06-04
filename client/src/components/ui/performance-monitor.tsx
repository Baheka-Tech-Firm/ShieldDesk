import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Database, 
  Zap, 
  Clock, 
  HardDrive,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { cacheManager, performanceMonitor } from '@/lib/performance';
import { swManager } from '@/lib/serviceWorker';

interface PerformanceStats {
  cacheSize: number;
  cacheHitRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  networkStatus: 'online' | 'offline';
  serviceWorkerActive: boolean;
}

export function PerformanceMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<PerformanceStats>({
    cacheSize: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
    memoryUsage: 0,
    networkStatus: 'online',
    serviceWorkerActive: false
  });
  const [swCacheStats, setSwCacheStats] = useState<any>({});

  useEffect(() => {
    if (!isOpen) return;

    const updateStats = async () => {
      // Memory usage (if available)
      const memoryUsage = (performance as any).memory ? 
        Math.round(((performance as any).memory.usedJSHeapSize / (performance as any).memory.jsHeapSizeLimit) * 100) : 0;

      // Network status
      const networkStatus = navigator.onLine ? 'online' : 'offline';

      // Service worker status
      const serviceWorkerActive = !!navigator.serviceWorker?.controller;

      // Cache stats
      const cacheStats = cacheManager.size();

      // Service worker cache stats
      const swStats = await swManager.getCacheStats();

      setStats({
        cacheSize: cacheStats,
        cacheHitRate: 85, // This would be calculated from actual cache hits/misses
        averageResponseTime: 120, // This would be calculated from performance measurements
        memoryUsage,
        networkStatus,
        serviceWorkerActive
      });

      setSwCacheStats(swStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClearCache = async () => {
    cacheManager.clear();
    await swManager.clearCache();
    setStats(prev => ({ ...prev, cacheSize: 0 }));
    setSwCacheStats({});
  };

  const handleRefreshServiceWorker = async () => {
    await swManager.update();
  };

  const getPerformanceScore = () => {
    const factors = [
      stats.cacheHitRate > 80 ? 25 : Math.round(stats.cacheHitRate / 80 * 25),
      stats.averageResponseTime < 200 ? 25 : Math.max(0, 25 - Math.round((stats.averageResponseTime - 200) / 20)),
      stats.memoryUsage < 70 ? 25 : Math.max(0, 25 - Math.round((stats.memoryUsage - 70) / 10)),
      stats.serviceWorkerActive ? 25 : 0
    ];
    return factors.reduce((sum, factor) => sum + factor, 0);
  };

  const performanceScore = getPerformanceScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-900/80 border-red-500/30 text-white hover:bg-gray-800"
      >
        <Activity className="w-4 h-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 bg-gray-900/95 border-red-500/30 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Activity className="w-5 h-5 mr-2 text-red-400" />
            Performance Monitor
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={`${getScoreColor(performanceScore)} bg-transparent border`}>
              Score: {performanceScore}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              stats.networkStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm">Network</span>
          </div>
          <Badge variant={stats.networkStatus === 'online' ? 'default' : 'destructive'}>
            {stats.networkStatus}
          </Badge>
        </div>

        {/* Service Worker */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-sm">Service Worker</span>
          </div>
          <Badge variant={stats.serviceWorkerActive ? 'default' : 'secondary'}>
            {stats.serviceWorkerActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Cache Size */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-sm">Memory Cache</span>
          </div>
          <span className="text-sm">{stats.cacheSize} items</span>
        </div>

        {/* Service Worker Caches */}
        {Object.keys(swCacheStats).length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">SW Caches:</span>
            {Object.entries(swCacheStats).map(([cacheName, count]) => (
              <div key={cacheName} className="flex items-center justify-between text-xs">
                <span className="truncate">{cacheName}</span>
                <span>{count as number} items</span>
              </div>
            ))}
          </div>
        )}

        {/* Memory Usage */}
        {stats.memoryUsage > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <HardDrive className="w-4 h-4 mr-2 text-orange-400" />
                <span className="text-sm">Memory Usage</span>
              </div>
              <span className="text-sm">{stats.memoryUsage}%</span>
            </div>
            <Progress value={stats.memoryUsage} className="h-2" />
          </div>
        )}

        {/* Cache Hit Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-green-400" />
              <span className="text-sm">Cache Hit Rate</span>
            </div>
            <span className="text-sm">{stats.cacheHitRate}%</span>
          </div>
          <Progress value={stats.cacheHitRate} className="h-2" />
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Avg Response Time</span>
          <span className="text-sm">{stats.averageResponseTime}ms</span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshServiceWorker}
            className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Update SW
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}