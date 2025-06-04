import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  variant?: 'default' | 'dashboard' | 'vault' | 'monitoring';
  intensity?: number;
  className?: string;
}

export function ThreeBackground({ 
  variant = 'default', 
  intensity = 1.0,
  className = ''
}: ThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Particle system
    const particleCount = variant === 'monitoring' ? 2000 : variant === 'vault' ? 1500 : 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    // Color schemes based on variant
    const colorSchemes = {
      default: [
        new THREE.Color(0xff0000), // Red
        new THREE.Color(0x990000), // Dark red
        new THREE.Color(0x666666), // Gray
        new THREE.Color(0x333333)  // Dark gray
      ],
      dashboard: [
        new THREE.Color(0xff0000),
        new THREE.Color(0xcc0000),
        new THREE.Color(0x555555),
        new THREE.Color(0x222222)
      ],
      vault: [
        new THREE.Color(0xff0000),
        new THREE.Color(0xaa0000),
        new THREE.Color(0x444444),
        new THREE.Color(0x111111)
      ],
      monitoring: [
        new THREE.Color(0xff0000),
        new THREE.Color(0xff3333),
        new THREE.Color(0x333333),
        new THREE.Color(0x000000)
      ]
    };

    const currentColors = colorSchemes[variant];

    for (let i = 0; i < particleCount; i++) {
      // Positions
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      // Velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      // Colors
      const color = currentColors[Math.floor(Math.random() * currentColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: variant === 'monitoring' ? 0.8 : 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6 * intensity,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Grid system for cybersecurity aesthetic
    const gridSize = 50;
    const gridDivisions = 50;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x330000, 0x110000);
    gridHelper.position.y = -20;
    gridHelper.material.opacity = 0.3 * intensity;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Floating geometric shapes
    const geometries = [
      new THREE.OctahedronGeometry(0.5),
      new THREE.TetrahedronGeometry(0.7),
      new THREE.IcosahedronGeometry(0.6)
    ];

    const shapeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
      transparent: true,
      opacity: 0.4 * intensity
    });

    const shapes: THREE.Mesh[] = [];
    for (let i = 0; i < 20; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const shape = new THREE.Mesh(geometry, shapeMaterial.clone());
      
      shape.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80
      );
      
      shape.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      shapes.push(shape);
      scene.add(shape);
    }

    camera.position.z = 30;

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Animate particles
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];

        // Boundary check
        if (Math.abs(positions[i * 3]) > 50) velocities[i * 3] *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 50) velocities[i * 3 + 1] *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 50) velocities[i * 3 + 2] *= -1;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Animate shapes
      shapes.forEach((shape, index) => {
        shape.rotation.x += 0.005 + (index * 0.001);
        shape.rotation.y += 0.003 + (index * 0.0005);
        shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
      });

      // Rotate entire particle system
      particleSystem.rotation.x += 0.001;
      particleSystem.rotation.y += 0.002;

      // Camera movement
      camera.position.x = Math.sin(Date.now() * 0.0005) * 5;
      camera.position.y = Math.cos(Date.now() * 0.0003) * 3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [variant, intensity]);

  return (
    <div 
      ref={mountRef} 
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}

export default ThreeBackground;