import { ReactNode, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'security' | 'warning' | 'success' | 'danger';
  glowIntensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
  hoverable?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  glowIntensity = 'medium',
  animated = true,
  hoverable = true
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animated || !cardRef.current) return;

    // Entry animation
    gsap.fromTo(cardRef.current, 
      {
        opacity: 0,
        y: 20,
        scale: 0.95,
        rotationX: -10
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: Math.random() * 0.3
      }
    );

    // Floating animation
    gsap.to(cardRef.current, {
      y: "+=5",
      duration: 2,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });
  }, [animated]);

  const handleMouseEnter = () => {
    if (!hoverable || !cardRef.current || !glowRef.current) return;

    gsap.to(cardRef.current, {
      scale: 1.02,
      duration: 0.3,
      ease: "power2.out"
    });

    gsap.to(glowRef.current, {
      opacity: 1,
      scale: 1.1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    if (!hoverable || !cardRef.current || !glowRef.current) return;

    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });

    gsap.to(glowRef.current, {
      opacity: 0.6,
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const variantStyles = {
    default: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      glow: 'rgba(59, 130, 246, 0.3)'
    },
    security: {
      background: 'rgba(34, 197, 94, 0.05)',
      border: '1px solid rgba(34, 197, 94, 0.2)',
      glow: 'rgba(34, 197, 94, 0.4)'
    },
    warning: {
      background: 'rgba(251, 146, 60, 0.05)',
      border: '1px solid rgba(251, 146, 60, 0.2)',
      glow: 'rgba(251, 146, 60, 0.4)'
    },
    success: {
      background: 'rgba(34, 197, 94, 0.05)',
      border: '1px solid rgba(34, 197, 94, 0.2)',
      glow: 'rgba(34, 197, 94, 0.4)'
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.05)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      glow: 'rgba(239, 68, 68, 0.4)'
    }
  };

  const glowIntensityStyles = {
    low: '0 0 20px',
    medium: '0 0 40px',
    high: '0 0 60px'
  };

  const currentVariant = variantStyles[variant];

  return (
    <div className="relative">
      {/* Glow effect */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-lg opacity-60 transition-opacity duration-300"
        style={{
          background: currentVariant.glow,
          filter: 'blur(20px)',
          boxShadow: `${glowIntensityStyles[glowIntensity]} ${currentVariant.glow}`
        }}
      />
      
      {/* Main card */}
      <div
        ref={cardRef}
        className={cn(
          "relative rounded-lg backdrop-blur-md border shadow-xl transition-all duration-300",
          "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-20",
          "after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-t after:from-black/10 after:to-transparent",
          className
        )}
        style={{
          background: currentVariant.background,
          border: currentVariant.border,
          boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.1), ${glowIntensityStyles[glowIntensity]} ${currentVariant.glow}`
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}

export default GlassCard;