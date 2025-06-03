import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

interface CyberHUDProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'critical' | 'success';
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CyberHUD({
  title,
  value,
  subtitle,
  trend,
  status = 'normal',
  animated = true,
  size = 'md'
}: CyberHUDProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!animated || !containerRef.current) return;

    // Entry animation
    gsap.fromTo(containerRef.current, 
      { 
        opacity: 0, 
        scale: 0.8,
        rotationY: -15
      },
      {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: Math.random() * 0.2
      }
    );

    // Glow pulse animation
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        scale: 1.1,
        opacity: 0.8,
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });
    }
  }, [animated]);

  useEffect(() => {
    if (typeof value === 'number' && valueRef.current) {
      const obj = { value: animatedValue };
      gsap.to(obj, {
        value: value,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          setAnimatedValue(Math.round(obj.value));
        }
      });
    }
  }, [value, animatedValue]);

  const statusColors = {
    normal: {
      primary: '#00d4ff',
      secondary: '#0099cc',
      glow: 'rgba(0, 212, 255, 0.5)',
      text: 'text-cyan-400'
    },
    warning: {
      primary: '#ff9500',
      secondary: '#cc7700',
      glow: 'rgba(255, 149, 0, 0.5)',
      text: 'text-orange-400'
    },
    critical: {
      primary: '#ff3366',
      secondary: '#cc1144',
      glow: 'rgba(255, 51, 102, 0.5)',
      text: 'text-red-400'
    },
    success: {
      primary: '#00ff88',
      secondary: '#00cc66',
      glow: 'rgba(0, 255, 136, 0.5)',
      text: 'text-green-400'
    }
  };

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg'
  };

  const valueSizeClasses = {
    sm: 'text-lg font-bold',
    md: 'text-2xl font-bold',
    lg: 'text-4xl font-bold'
  };

  const currentColors = statusColors[status];
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';

  return (
    <div ref={containerRef} className="relative group">
      {/* Outer glow */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-lg opacity-60"
        style={{
          background: `radial-gradient(circle, ${currentColors.glow} 0%, transparent 70%)`,
          filter: 'blur(15px)'
        }}
      />

      {/* Scanner lines */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div 
          className="absolute w-full h-px animate-pulse"
          style={{
            background: `linear-gradient(90deg, transparent, ${currentColors.primary}, transparent)`,
            top: '20%',
            animation: 'scan 3s linear infinite'
          }}
        />
        <div 
          className="absolute w-full h-px animate-pulse"
          style={{
            background: `linear-gradient(90deg, transparent, ${currentColors.secondary}, transparent)`,
            top: '80%',
            animation: 'scan 4s linear infinite reverse'
          }}
        />
      </div>

      {/* Main container */}
      <div
        className={cn(
          "relative backdrop-blur-md border rounded-lg transition-all duration-300",
          "bg-gradient-to-br from-black/40 to-black/20",
          "border-cyan-500/30 hover:border-cyan-400/50",
          "shadow-xl hover:shadow-2xl",
          sizeClasses[size]
        )}
        style={{
          borderColor: `${currentColors.primary}40`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px ${currentColors.glow}`
        }}
      >
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-4 h-4">
          <div 
            className="absolute top-0 left-0 w-4 h-px"
            style={{ background: currentColors.primary }}
          />
          <div 
            className="absolute top-0 left-0 w-px h-4"
            style={{ background: currentColors.primary }}
          />
        </div>
        <div className="absolute top-0 right-0 w-4 h-4">
          <div 
            className="absolute top-0 right-0 w-4 h-px"
            style={{ background: currentColors.primary }}
          />
          <div 
            className="absolute top-0 right-0 w-px h-4"
            style={{ background: currentColors.primary }}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-4 h-4">
          <div 
            className="absolute bottom-0 left-0 w-4 h-px"
            style={{ background: currentColors.primary }}
          />
          <div 
            className="absolute bottom-0 left-0 w-px h-4"
            style={{ background: currentColors.primary }}
          />
        </div>
        <div className="absolute bottom-0 right-0 w-4 h-4">
          <div 
            className="absolute bottom-0 right-0 w-4 h-px"
            style={{ background: currentColors.primary }}
          />
          <div 
            className="absolute bottom-0 right-0 w-px h-4"
            style={{ background: currentColors.primary }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Title */}
          <div className="flex items-center justify-between mb-2">
            <h3 
              className="font-mono text-xs uppercase tracking-wider opacity-80"
              style={{ color: currentColors.primary }}
            >
              {title}
            </h3>
            {trend && (
              <span 
                className="text-xs font-mono"
                style={{ color: currentColors.secondary }}
              >
                {trendIcon}
              </span>
            )}
          </div>

          {/* Value */}
          <div ref={valueRef} className={cn(valueSizeClasses[size], currentColors.text)}>
            {typeof value === 'number' ? animatedValue : value}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div 
              className="text-xs font-mono mt-1 opacity-60"
              style={{ color: currentColors.secondary }}
            >
              {subtitle}
            </div>
          )}

          {/* Status indicator */}
          <div className="absolute top-2 right-2">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ 
                background: currentColors.primary,
                boxShadow: `0 0 10px ${currentColors.glow}`
              }}
            />
          </div>
        </div>

        {/* Data stream effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <div 
            className="absolute -right-20 top-0 h-full w-1 opacity-20 animate-pulse"
            style={{
              background: `linear-gradient(to bottom, transparent, ${currentColors.primary}, transparent)`,
              animation: 'dataStream 2s linear infinite'
            }}
          />
        </div>
      </div>


    </div>
  );
}