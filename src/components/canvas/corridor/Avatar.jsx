import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { useTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Custom shader for magnifying glass reveal effect
const MagnifyMaterial = shaderMaterial(
    {
        uSketch: null,
        uReal: null,
        uCenter: new THREE.Vector2(0.5, 0.5),
        uRadius: 0.0, // Start hidden
        uEdgeSoftness: 0.05,
        uMagnify: 1.60,
        uTime: 0,
        uVisible: 0.0,
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    // Fragment Shader
    `
    varying vec2 vUv;
    uniform sampler2D uSketch;
    uniform sampler2D uReal;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uEdgeSoftness;
    uniform float uMagnify;
    uniform float uVisible;

    void main() {
      float dist = distance(vUv, uCenter);
      
      // Sketch color
      vec4 sketchCol = texture2D(uSketch, vUv);
      
      // Magnified UV for the real face
      vec2 magnifiedUv = uCenter + (vUv - uCenter) / uMagnify;
      vec4 realCol = texture2D(uReal, magnifiedUv);

      // Smooth mask
      float mask = (1.0 - smoothstep(uRadius - uEdgeSoftness, uRadius, dist)) * uVisible;
      
      // Mix sketch and real
      vec4 finalCol = mix(sketchCol, realCol, mask);
      
      // Handle transparency
      if (mask > 0.01) {
          finalCol.a = max(sketchCol.a, mask);
      } else {
          finalCol.a = sketchCol.a;
      }

      gl_FragColor = finalCol;
    }
    `
);

extend({ MagnifyMaterial });

/**
 * Avatar Component - Hand-drawn sketch style character
 */
const Avatar = ({ position = [10, -20, 30] }) => {
    const meshRef = useRef();
    const groupRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 1.2, height: 2.4 });
    const { camera } = useThree();

    // Dodge state
    const dodgeX = useRef(0);
    const targetDodgeX = useRef(0);
    const worldPosVec = useRef(new THREE.Vector3());

    // --- FRAME-BY-FRAME ANIMATION (PING-PONG) ---
    const TOTAL_FRAMES = 9;
    const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => `/textures/corridor/avatar_anim/${i + 1}.webp`);

    // Load all texture frames
    const textures = useTexture(framePaths);

    const currentFrame = useRef(0);
    const isReversing = useRef(false);
    const frameTimer = useRef(0);

    // Magnify effect refs
    const lensRef = useRef();
    const materialRef = useRef();
    const mouseUv = useRef(new THREE.Vector2(0.5, 0.5));
    const isOverFace = useRef(false);
    const currentRadius = useRef(0);

    // Load real face texture
    const realFaceTex = useTexture('/pic.jpeg');
    realFaceTex.colorSpace = THREE.SRGBColorSpace;

    // Apply color space and calculate dimensions once
    useEffect(() => {
        textures.forEach(tex => tex.colorSpace = THREE.SRGBColorSpace);

        if (textures[0] && textures[0].image) {
            const aspectRatio = textures[0].image.width / textures[0].image.height;
            const baseHeight = 2.3; // Fixed size
            setDimensions({
                width: baseHeight * aspectRatio,
                height: baseHeight
            });
        }
    }, [textures]);

    // Main animation loop
    useFrame((state, delta) => {
        if (!groupRef.current || !meshRef.current) return;

        // === DODGE LOGIC ===
        groupRef.current.getWorldPosition(worldPosVec.current);
        const distance = camera.position.z - worldPosVec.current.z;

        const DODGE_START = 3;
        const DODGE_PEAK = 0;
        const DODGE_END = -2;
        const DODGE_AMOUNT = -1.5;

        if (distance > DODGE_PEAK && distance < DODGE_START) {
            const t = (DODGE_START - distance) / (DODGE_START - DODGE_PEAK);
            targetDodgeX.current = DODGE_AMOUNT * easeOutQuad(t);
        } else if (distance <= DODGE_PEAK && distance > DODGE_END) {
            const t = (distance - DODGE_END) / (DODGE_PEAK - DODGE_END);
            targetDodgeX.current = DODGE_AMOUNT * easeOutQuad(t);
        } else {
            targetDodgeX.current = 0;
        }

        dodgeX.current = THREE.MathUtils.lerp(dodgeX.current, targetDodgeX.current, 0.08);

        groupRef.current.position.x = position[0] + dodgeX.current;
        groupRef.current.position.y = position[1];

        // === FRAME ANIMATION LOGIC ===
        const FPS = 20; 
        const frameDuration = 1 / FPS;
        frameTimer.current += delta;

        if (frameTimer.current >= frameDuration) {
            frameTimer.current = 0; 
            if (currentFrame.current >= TOTAL_FRAMES - 1) isReversing.current = true;
            else if (currentFrame.current <= 0) isReversing.current = false;

            if (isReversing.current) currentFrame.current -= 1;
            else currentFrame.current += 1;

            const safeIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, currentFrame.current));
            if (materialRef.current) {
                materialRef.current.uSketch = textures[safeIndex];
            }
        }

        // === MAGNIFY EFFECT LOGIC ===
        const raycaster = state.raycaster;
        const intersects = raycaster.intersectObject(meshRef.current);
        
        if (intersects.length > 0) {
            isOverFace.current = true;
            mouseUv.current.lerp(intersects[0].uv, 0.2);
        } else {
            isOverFace.current = false;
        }

        const targetRadius = isOverFace.current ? 0.35 : 0.0;
        const targetVisible = isOverFace.current ? 1.0 : 0.0;
        
        currentRadius.current = THREE.MathUtils.lerp(currentRadius.current, targetRadius, 0.1);
        
        if (materialRef.current) {
            materialRef.current.uCenter = mouseUv.current;
            materialRef.current.uRadius = currentRadius.current;
            materialRef.current.uVisible = THREE.MathUtils.lerp(materialRef.current.uVisible, targetVisible, 0.1);
        }

        if (lensRef.current && isOverFace.current) {
            lensRef.current.visible = true;
            lensRef.current.position.copy(intersects[0].point);
            lensRef.current.position.z += 0.02;
            
            const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 4) * 0.02;
            lensRef.current.scale.setScalar(pulse);
        } else if (lensRef.current) {
            lensRef.current.visible = false;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            <mesh ref={meshRef}>
                <planeGeometry args={[dimensions.width, dimensions.height]} />
                <magnifyMaterial 
                    ref={materialRef}
                    uSketch={textures[0]}
                    uReal={realFaceTex}
                    transparent={true}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            <group ref={lensRef} visible={false}>
                <mesh>
                    <ringGeometry args={[0.65, 0.70, 64]} />
                    <meshBasicMaterial color="#333" transparent opacity={0.8} />
                </mesh>
                <mesh>
                    <circleGeometry args={[0.65, 64]} />
                    <meshBasicMaterial color="#4A90E2" transparent opacity={0.1} />
                </mesh>
            </group>
        </group>
    );
};

const easeOutQuad = (t) => t * (2 - t);

export default Avatar;
