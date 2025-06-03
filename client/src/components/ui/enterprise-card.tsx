import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EnterpriseCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function EnterpriseCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  status = 'info',
  className,
  children,
  onClick
}: EnterpriseCardProps) {
  const statusColors = {
    success: 'border-emerald-500/30 bg-emerald-950/20',
    warning: 'border-amber-500/30 bg-amber-950/20',
    danger: 'border-red-500/30 bg-red-950/20',
    info: 'border-blue-500/30 bg-blue-950/20'
  };

  const iconColors = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    info: 'text-blue-400'
  };

  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border backdrop-blur-xl transition-all duration-300',
        'hover:shadow-xl hover:shadow-red-500/10 cursor-pointer',
        statusColors[status],
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-gray-900/30 to-red-950/20" />
      
      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {Icon && (
                <div className={cn(
                  'p-2 rounded-lg bg-black/20 border border-white/10',
                  iconColors[status]
                )}>
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                {title}
              </h3>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {value}
              </span>
              {trend && trendValue && (
                <span className={cn(
                  'text-sm font-medium',
                  trendColors[trend]
                )}>
                  {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
                </span>
              )}
            </div>
            
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/0 to-red-600/5 opacity-0 transition-opacity duration-300 hover:opacity-100" />
    </motion.div>
  );
}