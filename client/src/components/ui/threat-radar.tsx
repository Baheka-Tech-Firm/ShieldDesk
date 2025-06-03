import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThreatRadarProps {
  threats: Array<{
    angle: number;
    distance: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    label: string;
  }>;
  className?: string;
}

export function ThreatRadar({ threats, className }: ThreatRadarProps) {
  const severityColors = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444'
  };

  return (
    <div className={cn('relative w-full h-64', className)}>
      <svg width="100%" height="100%" viewBox="0 0 200 200" className="overflow-visible">
        {/* Radar rings */}
        {[1, 2, 3, 4].map((ring) => (
          <circle
            key={ring}
            cx="100"
            cy="100"
            r={ring * 20}
            fill="none"
            stroke="rgba(239, 68, 68, 0.2)"
            strokeWidth="1"
            className="animate-pulse"
          />
        ))}
        
        {/* Radar sweep */}
        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="20"
          stroke="rgba(239, 68, 68, 0.8)"
          strokeWidth="2"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '100px 100px' }}
        />
        
        {/* Grid lines */}
        <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(239, 68, 68, 0.1)" strokeWidth="1" />
        <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(239, 68, 68, 0.1)" strokeWidth="1" />
        
        {/* Threat points */}
        {threats.map((threat, index) => {
          const x = 100 + Math.cos((threat.angle - 90) * Math.PI / 180) * threat.distance;
          const y = 100 + Math.sin((threat.angle - 90) * Math.PI / 180) * threat.distance;
          
          return (
            <motion.g key={index}>
              <motion.circle
                cx={x}
                cy={y}
                r="4"
                fill={severityColors[threat.severity]}
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.circle
                cx={x}
                cy={y}
                r="8"
                fill="none"
                stroke={severityColors[threat.severity]}
                strokeWidth="1"
                opacity="0.5"
                initial={{ scale: 0 }}
                animate={{ scale: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.g>
          );
        })}
      </svg>
      
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold text-white">RADAR</div>
          <div className="text-xs text-gray-400">THREAT DETECTION</div>
        </div>
      </div>
    </div>
  );
}