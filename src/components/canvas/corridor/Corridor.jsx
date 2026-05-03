import { useMemo } from 'react';
import { useTexture, MeshReflectorMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Corridor Component - Hyper-Realistic Upgrade
 */
const Corridor = ({ length = 100 }) => {
    const corridorWidth = 4;
    const corridorHeight = 3.5;

    // Load textures
    const floorTexture = useTexture('/textures/corridor/real_floor.png');
    const ceilingTexture = useTexture('/textures/corridor/real_ceiling.png');

    useMemo(() => {
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        ceilingTexture.wrapS = ceilingTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.colorSpace = THREE.SRGBColorSpace;
        ceilingTexture.colorSpace = THREE.SRGBColorSpace;
    }, [floorTexture, ceilingTexture]);

    const zOffset = -length / 2 + 5;

    return (
        <group>
            {/* GLOBAL LIGHTING & ENVIRONMENT */}
            <ambientLight intensity={0.4} />
            <Environment preset="city" />
            
            {/* Soft shadow for overall atmosphere */}
            <directionalLight 
                position={[5, 5, 5]} 
                intensity={0.2} 
                castShadow 
                shadow-mapSize={[1024, 1024]}
            />

            {/* Floor - Ultra Realistic with Reflective Material */}
            <mesh
                position={[0, -corridorHeight / 2, zOffset]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[corridorWidth, length]} />
                <MeshReflectorMaterial
                    blur={[300, 100]}
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={80}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#0a0a0a"
                    metalness={0.8}
                    mirror={1}
                    map={floorTexture}
                    map-repeat={[corridorWidth / 3, length / 3]}
                />
            </mesh>

            {/* Ceiling - High-end Acoustic Panels */}
            <mesh
                position={[0, corridorHeight / 2, zOffset]}
                rotation={[Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[corridorWidth, length]} />
                <meshStandardMaterial
                    map={ceilingTexture}
                    map-repeat={[corridorWidth / 4, length / 4]}
                    roughness={0.9}
                    metalness={0.05}
                    emissive="#ffffff"
                    emissiveIntensity={0.02}
                />
            </mesh>

            <mesh
                position={[-corridorWidth / 2, 0, zOffset]}
                rotation={[0, Math.PI / 2, 0]}
            >
                <planeGeometry args={[length, corridorHeight]} />
                <meshStandardMaterial
                    color="#222222"
                    roughness={0.4}
                    metalness={0.1}
                />
            </mesh>

            <mesh
                position={[corridorWidth / 2, 0, zOffset]}
                rotation={[0, -Math.PI / 2, 0]}
            >
                <planeGeometry args={[length, corridorHeight]} />
                <meshStandardMaterial
                    color="#222222"
                    roughness={0.4}
                    metalness={0.1}
                />
            </mesh>

            {/* End wall */}
            <mesh position={[0, 0, zOffset - length / 2 + 0.5]}>
                <planeGeometry args={[corridorWidth, corridorHeight]} />
                <meshStandardMaterial color="#c0c0c0" roughness={0.8} />
            </mesh>
        </group>
    );
};

export default Corridor;
