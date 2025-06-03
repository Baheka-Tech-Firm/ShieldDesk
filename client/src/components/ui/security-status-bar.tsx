import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SecurityStatusBarProps {
  overallStatus: 'secure' | 'warning' | 'critical' | 'maintenance';
  activeThreats: number;
  resolvedThreats: number;
  uptime: string;
  lastScan: string;
  className?: string;
}

export function SecurityStatusBar({
  overallStatus,
  activeThreats,
  resolvedThreats,
  uptime,
  lastScan,
  className
}: SecurityStatusBarProps) {
  const statusConfig = {
    secure: {
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
      icon: Shield,
      label: 'SECURE'
    },
    warning: {
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      icon: AlertTriangle,
      label: 'WARNING'
    },
    critical: {
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      icon: AlertTriangle,
      label: 'CRITICAL'
    },
    maintenance: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      icon: Clock,
      label: 'MAINTENANCE'
    }
  };

  const config = statusConfig[overallStatus];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border backdrop-blur-xl',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn('flex items-center gap-2', config.color)}>
          <StatusIcon className="w-5 h-5" />
          <span className="font-semibold">{config.label}</span>
          <motion.div
            className={cn('w-2 h-2 rounded-full', config.color.replace('text-', 'bg-'))}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        
        <div className="flex items-center gap-6 text-sm text-gray-300">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{activeThreats} Active</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{resolvedThreats} Resolved</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6 text-sm text-gray-400">
        <div>
          <span className="text-gray-500">Uptime:</span> {uptime}
        </div>
        <div>
          <span className="text-gray-500">Last Scan:</span> {lastScan}
        </div>
      </div>
    </motion.div>
  );
}