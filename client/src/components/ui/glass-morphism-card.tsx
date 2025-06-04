import { ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

interface GlassMorphismCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'cyber' | 'danger' | 'success';
  animated?: boolean;
  glowIntensity?: number;
  borderGlow?: boolean;
}

export function GlassMorphismCard({
  children,
  className = '',
  variant = 'default',
  animated = true,
  glowIntensity = 0.5,
  borderGlow = true
}: GlassMorphismCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationIdRef = useRef<number>();

  const variants = {
    default: {
      bg: 'bg-black/20',
      border: 'border-red-500/30',
      glow: 'shadow-red-500/20',
      backdrop: 'backdrop-blur-xl'
    },
    cyber: {
      bg: 'bg-black/30',
      border: 'border-red-400/40',
      glow: 'shadow-red-400/30',
      backdrop: 'backdrop-blur-2xl'
    },
    danger: {
      bg: 'bg-red-900/20',
      border: 'border-red-600/50',
      glow: 'shadow-red-600/40',
      backdrop: 'backdrop-blur-xl'
    },
    success: {
      bg: 'bg-gray-900/20',
      border: 'border-gray-500/40',
      glow: 'shadow-gray-500/30',
      backdrop: 'backdrop-blur-xl'
    }
  };

  const currentVariant = variants[variant];

  useEffect(() => {
    if (!animated || !canvasRef.current || !cardRef.current) return;

    const canvas = canvasRef.current;
    const rect = cardRef.current.getBoundingClientRect();
    
    canvas.width = rect.width;
    canvas.height = rect.height;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -rect.width / 2, rect.width / 2,
      rect.height / 2, -rect.height / 2,
      1, 1000
    );
    
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      alpha: true,
      antialias: true
    });
    
    renderer.setSize(rect.width, rect.height);
    renderer.setClearColor(0x000000, 0);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Create animated grid lines
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
      color: variant === 'danger' ? 0xff0000 : 0xff3333,
      transparent: true,
      opacity: 0.1
    });

    const points = [];
    const gridSize = 20;
    
    // Horizontal lines
    for (let i = -rect.height / 2; i <= rect.height / 2; i += gridSize) {
      points.push(new THREE.Vector3(-rect.width / 2, i, 0));
      points.push(new THREE.Vector3(rect.width / 2, i, 0));
    }
    
    // Vertical lines
    for (let i = -rect.width / 2; i <= rect.width / 2; i += gridSize) {
      points.push(new THREE.Vector3(i, -rect.height / 2, 0));
      points.push(new THREE.Vector3(i, rect.height / 2, 0));
    }

    geometry.setFromPoints(points);
    const grid = new THREE.LineSegments(geometry, material);
    scene.add(grid);

    // Add floating particles
    const particleCount = 50;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * rect.width;
      positions[i * 3 + 1] = (Math.random() - 0.5) * rect.height;
      positions[i * 3 + 2] = 0;

      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 2] = 0;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: variant === 'danger' ? 0xff0000 : 0xff3333,
      size: 1,
      transparent: true,
      opacity: 0.3
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    camera.position.z = 500;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Animate particles
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];

        // Wrap around edges
        if (positions[i * 3] > rect.width / 2) positions[i * 3] = -rect.width / 2;
        if (positions[i * 3] < -rect.width / 2) positions[i * 3] = rect.width / 2;
        if (positions[i * 3 + 1] > rect.height / 2) positions[i * 3 + 1] = -rect.height / 2;
        if (positions[i * 3 + 1] < -rect.height / 2) positions[i * 3 + 1] = rect.height / 2;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Pulse effect
      const time = Date.now() * 0.001;
      material.opacity = 0.05 + Math.sin(time) * 0.05;
      particleMaterial.opacity = 0.2 + Math.sin(time * 1.5) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [animated, variant]);

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-lg border transition-all duration-300',
        currentVariant.bg,
        currentVariant.border,
        currentVariant.backdrop,
        borderGlow && `shadow-lg ${currentVariant.glow}`,
        animated && 'hover:scale-[1.02] hover:shadow-xl',
        className
      )}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: `linear-gradient(135deg, 
          rgba(0, 0, 0, 0.1) 0%, 
          rgba(255, 0, 0, 0.05) 50%, 
          rgba(0, 0, 0, 0.1) 100%)`,
      }}
    >
      {animated && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ zIndex: 1 }}
        />
      )}
      
      <div className="relative z-10 p-6">
        {children}
      </div>

      {/* Cyber grid overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          zIndex: 2
        }}
      />

      {/* Animated border glow */}
      {borderGlow && (
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `linear-gradient(45deg, 
              transparent, 
              rgba(255, 0, 0, 0.1), 
              transparent, 
              rgba(255, 0, 0, 0.1), 
              transparent)`,
            backgroundSize: '200% 200%',
            animation: animated ? 'gradientShift 4s ease infinite' : 'none',
            zIndex: 0
          }}
        />
      )}
    </div>
  );
}

export default GlassMorphismCard;