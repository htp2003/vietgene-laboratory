// src/components/common/DNAHelix.jsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const DNAHelix = ({ width = 400, height = 500 }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const dnaGroupRef = useRef(null);
  const animationIdRef = useRef(null);
  const isMouseDownRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // transparent background
    mountRef.current.appendChild(renderer.domElement);

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Create DNA helix
    const dnaGroup = new THREE.Group();
    const helixHeight = 6;
    const helixRadius = 1.2;
    const turns = 2.5;
    const segmentsPerTurn = 16;
    const totalSegments = turns * segmentsPerTurn;

    // Materials - more realistic colors
    const backboneMaterial1 = new THREE.MeshBasicMaterial({ color: 0xe74c3c }); // softer red
    const backboneMaterial2 = new THREE.MeshBasicMaterial({ color: 0x2c3e50 }); // dark blue-gray
    const basePairMaterial1 = new THREE.MeshBasicMaterial({ color: 0x3498db }); // blue
    const basePairMaterial2 = new THREE.MeshBasicMaterial({ color: 0xf39c12 }); // orange
    const connectMaterial = new THREE.MeshBasicMaterial({ color: 0x95a5a6 }); // light gray

    // Create backbone points first
    const backbone1Points = [];
    const backbone2Points = [];
    
    for (let i = 0; i <= totalSegments; i++) {
      const angle = (i / segmentsPerTurn) * Math.PI * 2;
      const y = (i / totalSegments) * helixHeight - helixHeight / 2;

      const x1 = Math.cos(angle) * helixRadius;
      const z1 = Math.sin(angle) * helixRadius;
      const x2 = Math.cos(angle + Math.PI) * helixRadius;
      const z2 = Math.sin(angle + Math.PI) * helixRadius;

      backbone1Points.push(new THREE.Vector3(x1, y, z1));
      backbone2Points.push(new THREE.Vector3(x2, y, z2));
    }

    // Create smooth backbone curves
    const curve1 = new THREE.CatmullRomCurve3(backbone1Points);
    const curve2 = new THREE.CatmullRomCurve3(backbone2Points);
    
    const tubeGeometry1 = new THREE.TubeGeometry(curve1, totalSegments, 0.08, 8, false);
    const tubeGeometry2 = new THREE.TubeGeometry(curve2, totalSegments, 0.08, 8, false);
    
    const backbone1 = new THREE.Mesh(tubeGeometry1, backboneMaterial1);
    const backbone2 = new THREE.Mesh(tubeGeometry2, backboneMaterial2);
    
    dnaGroup.add(backbone1);
    dnaGroup.add(backbone2);

    // Add base pairs (connecting rungs)
    for (let i = 0; i < totalSegments; i += 4) { // every 4th segment
      const angle = (i / segmentsPerTurn) * Math.PI * 2;
      const y = (i / totalSegments) * helixHeight - helixHeight / 2;

      const x1 = Math.cos(angle) * helixRadius;
      const z1 = Math.sin(angle) * helixRadius;
      const x2 = Math.cos(angle + Math.PI) * helixRadius;
      const z2 = Math.sin(angle + Math.PI) * helixRadius;

      // Base pair connection
      const distance = Math.sqrt((x2-x1)**2 + (z2-z1)**2);
      const geometry = new THREE.CylinderGeometry(0.04, 0.04, distance * 0.8, 6);
      const basePair = new THREE.Mesh(geometry, connectMaterial);
      
      // Position and orient the base pair
      basePair.position.set((x1+x2)/2, y, (z1+z2)/2);
      basePair.lookAt(new THREE.Vector3(x2, y, z2));
      basePair.rotateX(Math.PI / 2);
      
      dnaGroup.add(basePair);

      // Add colored base spheres
      const base1 = new THREE.SphereGeometry(0.12, 8, 8);
      const base2 = new THREE.SphereGeometry(0.12, 8, 8);
      
      const baseMesh1 = new THREE.Mesh(base1, i % 8 === 0 ? basePairMaterial1 : basePairMaterial2);
      const baseMesh2 = new THREE.Mesh(base2, i % 8 === 0 ? basePairMaterial2 : basePairMaterial1);
      
      baseMesh1.position.set(x1 * 0.8, y, z1 * 0.8);
      baseMesh2.position.set(x2 * 0.8, y, z2 * 0.8);
      
      dnaGroup.add(baseMesh1);
      dnaGroup.add(baseMesh2);
    }

    dnaGroupRef.current = dnaGroup;
    scene.add(dnaGroup);

    // Position camera - better angle
    camera.position.set(3, 2, 5);
    camera.lookAt(0, 0, 0);

    // Mouse controls
    const handleMouseDown = (event) => {
      isMouseDownRef.current = true;
      mouseRef.current = {
        x: event.clientX,
        y: event.clientY
      };
    };

    const handleMouseMove = (event) => {
      if (!isMouseDownRef.current) return;

      const deltaX = event.clientX - mouseRef.current.x;
      const deltaY = event.clientY - mouseRef.current.y;

      targetRotationRef.current.y += deltaX * 0.01;
      targetRotationRef.current.x += deltaY * 0.01;

      // Limit vertical rotation
      targetRotationRef.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationRef.current.x));

      mouseRef.current = {
        x: event.clientX,
        y: event.clientY
      };
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    // Touch controls for mobile
    const handleTouchStart = (event) => {
      if (event.touches.length === 1) {
        isMouseDownRef.current = true;
        mouseRef.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      }
    };

    const handleTouchMove = (event) => {
      if (!isMouseDownRef.current || event.touches.length !== 1) return;
      
      event.preventDefault();
      const deltaX = event.touches[0].clientX - mouseRef.current.x;
      const deltaY = event.touches[0].clientY - mouseRef.current.y;

      targetRotationRef.current.y += deltaX * 0.01;
      targetRotationRef.current.x += deltaY * 0.01;
      targetRotationRef.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationRef.current.x));

      mouseRef.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    };

    const handleTouchEnd = () => {
      isMouseDownRef.current = false;
    };

    // Add event listeners
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (dnaGroupRef.current) {
        // Smooth rotation interpolation
        currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.1;
        currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.1;

        dnaGroupRef.current.rotation.x = currentRotationRef.current.x;
        dnaGroupRef.current.rotation.y = currentRotationRef.current.y;

        // Auto-rotation when not interacting - slower
        if (!isMouseDownRef.current) {
          targetRotationRef.current.y += 0.003;
        }
      }

      if (rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, camera);
      }
    };

    animate();

    // Cleanup
    return () => {
      // Stop animation loop
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      // Remove event listeners
      const canvas = rendererRef.current?.domElement;
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }

      // Clean up Three.js objects
      if (dnaGroupRef.current) {
        // Dispose geometries and materials
        dnaGroupRef.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        sceneRef.current?.remove(dnaGroupRef.current);
      }

      // Remove canvas from DOM
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [width, height]);

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={mountRef} 
        className="cursor-grab active:cursor-grabbing"
        style={{ width, height }}
      />
      <p className="text-sm text-gray-500 mt-2 text-center">
        Có thể tương tác với mô hình DNA bằng cách kéo chuột hoặc chạm trên màn hình.
      </p>
    </div>
  );
};

export default DNAHelix;