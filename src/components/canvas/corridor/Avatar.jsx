import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { useTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { usePerformance, TIERS } from '../../../context/PerformanceContext';

// Custom shader for magnifying glass reveal effect
const MagnifyMaterial = shaderMaterial(
    {
        uSketch: null,
        uReal: null,
        uCenter: new THREE.Vector2(0.5, 0.5),
        uRadius: 0.0,
        uEdgeSoftness: 0.05,
        uMagnify: 1.6,
        uTime: 0,
        uVisible: 0.0,
    },
    `
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // NATURAL ARC WAVE (Side-to-Side):
      // Strength is concentrated at the very tip of the hand
      float handMask = smoothstep(0.6, 1.0, uv.x) * smoothstep(0.3, 0.9, uv.y);
      
      // Horizontal wave (Right-Left)
      float waveX = sin(uTime * 10.0) * 0.25 * handMask;
      // Vertical arc (Down-Up) - pulling down slightly at the ends of the swing
      float waveY = -abs(waveX) * 0.4; 
      
      pos.x += waveX;
      pos.y += waveY;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
    `,
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
      vec4 sketchCol = texture2D(uSketch, vUv);
      vec2 magnifiedUv = uCenter + (vUv - uCenter) / uMagnify;
      vec4 realCol = texture2D(uReal, magnifiedUv);
      float mask = (1.0 - smoothstep(uRadius - uEdgeSoftness, uRadius, dist)) * uVisible;
      vec4 finalCol = mix(sketchCol, realCol, mask);
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

const Avatar = ({ position = [10, -20, 30] }) => {
    const meshRef = useRef();
    const groupRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 1.2, height: 2.4 });
    const { camera } = useThree();
    const { tier } = usePerformance();
    const isLowTier = tier === TIERS.LOW;

    const dodgeX = useRef(0);
    const targetDodgeX = useRef(0);
    const worldPosVec = useRef(new THREE.Vector3());

    const TOTAL_FRAMES = 1;
    const textures = [useTexture('/favico.png')];

    const currentFrame = useRef(0);
    const isReversing = useRef(false);
    const frameTimer = useRef(0);

    const lensRef = useRef();
    const materialRef = useRef();
    const mouseUv = useRef(new THREE.Vector2(0.5, 0.5));
    const isOverFace = useRef(false);
    const currentRadius = useRef(0);

    const realFaceTex = useTexture('/pic.png');

    useEffect(() => {
        textures.forEach(tex => tex.colorSpace = THREE.SRGBColorSpace);
        realFaceTex.colorSpace = THREE.SRGBColorSpace;
        if (textures[0] && textures[0].image) {
            const aspectRatio = textures[0].image.width / textures[0].image.height;
            // Adjust height to 2.8 for a better presence in the corridor
            setDimensions({ width: 2.8 * aspectRatio, height: 2.8 });
        }
    }, [textures, realFaceTex]);

    useFrame((state, delta) => {
        if (!groupRef.current || !meshRef.current) return;
        if (!groupRef.current.visible) return;

        // Skip complex dodging on low tier
        if (!isLowTier) {
            groupRef.current.getWorldPosition(worldPosVec.current);
            const distance = camera.position.z - worldPosVec.current.z;

            if (distance > 0 && distance < 3) {
                const t = (3 - distance) / 3;
                targetDodgeX.current = -1.5 * t * (2 - t);
            } else {
                targetDodgeX.current = 0;
            }

            dodgeX.current = THREE.MathUtils.lerp(dodgeX.current, targetDodgeX.current, 0.08);
            groupRef.current.position.x = position[0] + dodgeX.current;
        } else {
            groupRef.current.position.x = position[0];
        }

        // Body kept static so only the hand waves via the shader
        if (groupRef.current) {
            groupRef.current.position.x = position[0] + (dodgeX.current || 0);
            groupRef.current.position.y = position[1] - dimensions.height / 2;
            groupRef.current.rotation.z = 0;
            groupRef.current.rotation.y = 0;
        }

        // Animation loop removed for single static image

        const raycaster = state.raycaster;
        const intersects = raycaster.intersectObject(meshRef.current);
        if (intersects.length > 0) {
            isOverFace.current = true;
            mouseUv.current.lerp(intersects[0].uv, 0.2);
        } else {
            isOverFace.current = false;
        }

        const targetRadius = isOverFace.current ? 0.22 : 0.0;
        const targetVisible = isOverFace.current ? 1.0 : 0.0;

        // Much smoother lerping (0.05 instead of 0.1)
        currentRadius.current = THREE.MathUtils.lerp(currentRadius.current, targetRadius, 0.06);

        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
            materialRef.current.uSketch = textures[0]; // Always use the new face
            materialRef.current.uCenter = mouseUv.current;
            materialRef.current.uRadius = currentRadius.current;
            materialRef.current.uVisible = THREE.MathUtils.lerp(materialRef.current.uVisible, targetVisible, 0.06);
            // Dynamic edge softness based on radius
            materialRef.current.uEdgeSoftness = 0.02 + (currentRadius.current * 0.1);
        }

        if (lensRef.current && isOverFace.current) {
            lensRef.current.visible = true;
            lensRef.current.position.copy(intersects[0].point);
            lensRef.current.position.z += 0.02;
            // Subtle premium pulse
            const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 3) * 0.015;
            lensRef.current.scale.setScalar(pulse);
        } else if (lensRef.current) {
            lensRef.current.visible = false;
        }
    });

    return (
        <group ref={groupRef} position={[position[0], position[1] - dimensions.height / 2, position[2]]}>
            <mesh ref={meshRef} position={[0, dimensions.height / 2, 0]}>
                {/* High resolution geometry for smooth bending/waving */}
                <planeGeometry args={[dimensions.width, dimensions.height, 32, 32]} />
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
                {/* Smaller, more elegant lens ring */}
                <mesh><ringGeometry args={[0.42, 0.45, 64]} /><meshBasicMaterial color="#333" transparent opacity={0.6} /></mesh>
                <mesh><circleGeometry args={[0.42, 64]} /><meshBasicMaterial color="#4A90E2" transparent opacity={0.08} /></mesh>
            </group>
        </group>
    );
};

export default Avatar;
