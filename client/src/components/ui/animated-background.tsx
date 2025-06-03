import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface AnimatedBackgroundProps {
  variant?: 'security' | 'network' | 'data' | 'cyber';
  intensity?: 'low' | 'medium' | 'high';
  interactive?: boolean;
}

export function AnimatedBackground({ 
  variant = 'security', 
  intensity = 'medium',
  interactive = false 
}: AnimatedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const particlesRef = useRef<THREE.Points>();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Particle system based on variant
    const particleCount = intensity === 'high' ? 5000 : intensity === 'medium' ? 3000 : 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    // Color schemes for different variants
    const colorSchemes = {
      security: [
        new THREE.Color(0x00ff88), // Primary green
        new THREE.Color(0x0088ff), // Blue
        new THREE.Color(0x8800ff), // Purple
        new THREE.Color(0xff0088)  // Pink
      ],
      network: [
        new THREE.Color(0x00aaff),
        new THREE.Color(0x0066cc),
        new THREE.Color(0x003388),
        new THREE.Color(0x001144)
      ],
      data: [
        new THREE.Color(0xff6600),
        new THREE.Color(0xffaa00),
        new THREE.Color(0xffdd00),
        new THREE.Color(0xffff00)
      ],
      cyber: [
        new THREE.Color(0xff0044),
        new THREE.Color(0xff4400),
        new THREE.Color(0xff8800),
        new THREE.Color(0xffcc00)
      ]
    };

    const colors_palette = colorSchemes[variant];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Positions
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;

      // Velocities
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

      // Colors
      const color = colors_palette[Math.floor(Math.random() * colors_palette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle material
    const material = new THREE.PointsMaterial({
      size: intensity === 'high' ? 0.8 : intensity === 'medium' ? 0.6 : 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Network connections (lines between particles)
    if (variant === 'network' || variant === 'cyber') {
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array(particleCount * 6);
      let lineIndex = 0;

      for (let i = 0; i < particleCount; i += 10) {
        const i3 = i * 3;
        const nextI3 = ((i + 10) % particleCount) * 3;
        
        linePositions[lineIndex++] = positions[i3];
        linePositions[lineIndex++] = positions[i3 + 1];
        linePositions[lineIndex++] = positions[i3 + 2];
        linePositions[lineIndex++] = positions[nextI3];
        linePositions[lineIndex++] = positions[nextI3 + 1];
        linePositions[lineIndex++] = positions[nextI3 + 2];
      }

      lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      
      const lineMaterial = new THREE.LineBasicMaterial({
        color: colors_palette[0],
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
      });

      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);
    }

    // Camera position
    camera.position.z = 50;

    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

      const positions = particles.geometry.attributes.position.array as Float32Array;
      
      // Update particle positions
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];

        // Boundary checking and wrapping
        if (Math.abs(positions[i3]) > 50) velocities[i3] *= -1;
        if (Math.abs(positions[i3 + 1]) > 50) velocities[i3 + 1] *= -1;
        if (Math.abs(positions[i3 + 2]) > 50) velocities[i3 + 2] *= -1;
      }

      particles.geometry.attributes.position.needsUpdate = true;

      // Rotate the entire particle system
      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;

      // Camera movement
      const time = Date.now() * 0.0005;
      camera.position.x = Math.cos(time) * 2;
      camera.position.y = Math.sin(time) * 2;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Interactive mouse effects
    if (interactive) {
      const handleMouseMove = (event: MouseEvent) => {
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        
        gsap.to(camera.position, {
          duration: 2,
          x: mouseX * 5,
          y: mouseY * 5,
          ease: "power2.out"
        });
      };

      window.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [variant, intensity, interactive]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{
        background: variant === 'security' 
          ? 'radial-gradient(ellipse at center, rgba(0,20,40,0.9) 0%, rgba(0,5,15,0.95) 100%)'
          : variant === 'network'
          ? 'radial-gradient(ellipse at center, rgba(0,15,35,0.9) 0%, rgba(0,5,15,0.95) 100%)'
          : variant === 'data'
          ? 'radial-gradient(ellipse at center, rgba(25,15,0,0.9) 0%, rgba(15,5,0,0.95) 100%)'
          : 'radial-gradient(ellipse at center, rgba(25,0,15,0.9) 0%, rgba(15,0,5,0.95) 100%)'
      }}
    />
  );
}