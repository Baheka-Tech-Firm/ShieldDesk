import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DataPoint {
  time: string;
  value: number;
  status?: 'normal' | 'warning' | 'danger';
}

interface RealTimeChartProps {
  data: DataPoint[];
  title: string;
  className?: string;
  height?: number;
  showGrid?: boolean;
  animate?: boolean;
}

export function RealTimeChart({ 
  data, 
  title, 
  className, 
  height = 120,
  showGrid = true,
  animate = true 
}: RealTimeChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 2, ease: "easeInOut" }
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      
      <div className="relative" style={{ height }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Grid lines */}
          {showGrid && (
            <g stroke="rgba(239, 68, 68, 0.1)" strokeWidth="0.2">
              {[25, 50, 75].map(y => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} />
              ))}
              {[25, 50, 75].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="100" />
              ))}
            </g>
          )}
          
          {/* Area fill */}
          <motion.path
            d={`M 0,100 L ${points} L 100,100 Z`}
            fill="url(#gradient)"
            fillOpacity="0.3"
            initial={animate ? "hidden" : "visible"}
            animate="visible"
            variants={pathVariants}
          />
          
          {/* Main line */}
          <motion.polyline
            points={points}
            fill="none"
            stroke="#ef4444"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={animate ? "hidden" : "visible"}
            animate="visible"
            variants={pathVariants}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((point.value - minValue) / range) * 100;
            
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r="0.8"
                fill="#ef4444"
                initial={animate ? { scale: 0 } : { scale: 1 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            );
          })}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Value labels */}
        <div className="absolute top-0 right-0 text-xs text-gray-400">
          {maxValue}
        </div>
        <div className="absolute bottom-0 right-0 text-xs text-gray-400">
          {minValue}
        </div>
      </div>
      
      {/* Current value */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">Current</span>
        <span className="text-lg font-bold text-white">
          {data[data.length - 1]?.value || 0}
        </span>
      </div>
    </div>
  );
}