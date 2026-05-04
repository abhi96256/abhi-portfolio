import { useMemo, useRef } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture, MeshReflectorMaterial } from '@react-three/drei';
import { usePerformance, TIERS } from '../../../context/PerformanceContext';

const WALL_X_OUTER = 3.5;
const WALL_X_INNER = 1.7;

/**
 * CorridorWalls Component - Realistic Upgrade
 */
const CorridorWalls = ({ zStart = 10, length = 80, doorPositions = [], zClip = 100000 }) => {
    const corridorHeight = 3.5;
    const { tier } = usePerformance();
    const isLowTier = tier === TIERS.LOW;
    const isMediumTier = tier === TIERS.MEDIUM;

    // Load Realistic Textures
    const floorTexture = useTexture('/textures/corridor/real_floor.png');
    const ceilingTexture = useTexture('/textures/corridor/real_ceiling.png');
    const wallTexture = useTexture('/textures/corridor/wall_texture.webp');
    const baseboardTexture = useTexture('/textures/corridor/texturadoprogow.webp');

    useMemo(() => {
        [floorTexture, ceilingTexture, wallTexture, baseboardTexture].forEach(tex => {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.colorSpace = THREE.SRGBColorSpace;
        });
    }, [floorTexture, ceilingTexture, wallTexture, baseboardTexture]);

    const effectiveStart = Math.min(zStart, zClip);
    const effectiveLength = effectiveStart - (zStart - length);

    if (effectiveLength <= 0) return null;

    const generateWallSegments = (side) => {
        const segments = [];
        const isLeft = side === 'left';
        const baseX = isLeft ? -WALL_X_OUTER : WALL_X_OUTER;
        const innerX = isLeft ? -WALL_X_INNER : WALL_X_INNER;

        let currentZ = effectiveStart;
        const endZ = effectiveStart - effectiveLength;

        const sideDoors = doorPositions
            .filter(d => d.side === side)
            .sort((a, b) => b.relativeZ - a.relativeZ);

        sideDoors.forEach(door => {
            const doorZ = zStart + door.relativeZ;
            const doorStartZ = doorZ + 2.0;
            const doorEndZ = doorZ - 2.0;

            if (doorStartZ > currentZ) return;

            if (currentZ > doorStartZ) {
                const segLength = currentZ - doorStartZ;
                const segCenterZ = currentZ - segLength / 2;
                segments.push({
                    type: 'filler',
                    position: [baseX, 0, segCenterZ],
                    rotation: [0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0],
                    width: segLength,
                    isLeft,
                    trimLowZ: true
                });
            }

            const dx = innerX - baseX;
            const dz = doorEndZ - doorStartZ;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const baseRotation = -Math.atan2(dz, dx);
            const finalRotation = isLeft ? baseRotation : baseRotation + Math.PI;

            // These are the angled door walls
            segments.push({
                type: 'door-wall',
                position: [(baseX + innerX) / 2, 0, (doorStartZ + doorEndZ) / 2],
                rotationY: finalRotation,
                width: dist,
                side
            });

            currentZ = doorEndZ;
        });

        if (currentZ > endZ) {
            const segLength = currentZ - endZ;
            const segCenterZ = currentZ - segLength / 2;
            segments.push({
                type: 'filler',
                position: [baseX, 0, segCenterZ],
                rotation: [0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0],
                width: segLength,
                isLeft,
                trimHighZ: currentZ !== effectiveStart
            });
        }

        return segments;
    };

    const leftSegments = useMemo(() => generateWallSegments('left'), [effectiveStart, effectiveLength, doorPositions]);
    const rightSegments = useMemo(() => generateWallSegments('right'), [effectiveStart, effectiveLength, doorPositions]);

    return (
        <group>
            {/* Realistic Floor Tiles */}
            {(() => {
                const TILE_LENGTH = 10;
                const CENTER_WIDTH = 5;
                const SIDE_WIDTH = 1;
                const FLOOR_START_OFFSET = 2;
                const tiles = [];
                const floorY = -corridorHeight / 2;
                const segmentEndZ = effectiveStart - effectiveLength;

                const firstTileIndex = Math.floor(effectiveStart / TILE_LENGTH);
                let tileZ = firstTileIndex * TILE_LENGTH - TILE_LENGTH / 2 + FLOOR_START_OFFSET;

                while (tileZ + TILE_LENGTH / 2 > segmentEndZ) {
                    const isMirrored = Math.abs(Math.round(tileZ / TILE_LENGTH)) % 2 === 1;
                    tiles.push(
                        <mesh key={`f-${tileZ}`} position={[0, floorY, tileZ]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                            <planeGeometry args={[TILE_LENGTH, CENTER_WIDTH]} />
                            {isLowTier ? (
                                <meshStandardMaterial
                                    color="#151515"
                                    map={floorTexture}
                                    roughness={0.8}
                                    metalness={0.2}
                                />
                            ) : (
                                <MeshReflectorMaterial
                                    blur={[300, 100]}
                                    resolution={isMediumTier ? 512 : 1024}
                                    mixBlur={1}
                                    mixStrength={isMediumTier ? 30 : 40}
                                    roughness={1}
                                    depthScale={1.2}
                                    minDepthThreshold={0.4}
                                    maxDepthThreshold={1.4}
                                    color="#151515"
                                    metalness={0.5}
                                    mirror={1}
                                    map={floorTexture}
                                />
                            )}
                        </mesh>
                    );
                    tileZ -= TILE_LENGTH;
                }
                return tiles;
            })()}

            {/* Realistic Ceiling Tiles with Lights */}
            {(() => {
                const tileLength = 10;
                const tileWidth = 7;
                const tiles = [];
                const ceilingY = corridorHeight / 2;
                const segmentEndZ = effectiveStart - effectiveLength;

                let tileZ = Math.floor(effectiveStart / tileLength) * tileLength - tileLength / 2 + 2;

                while (tileZ + tileLength / 2 > segmentEndZ) {
                    tiles.push(
                        <group key={`c-group-${tileZ}`}>
                            <mesh position={[0, ceilingY, tileZ]} rotation={[Math.PI / 2, 0, 0]}>
                                <planeGeometry args={[tileWidth, tileLength]} />
                                <meshStandardMaterial
                                    map={ceilingTexture}
                                    roughness={0.9}
                                    metalness={0.0}
                                    emissive="#ffffff"
                                    emissiveIntensity={isLowTier ? 0.01 : 0.02}
                                />
                            </mesh>
                            {/* CEILING LIGHT FIXTURES - Optimized for performance tiers */}
                            {!isLowTier && (
                                <pointLight
                                    position={[0, ceilingY - 0.2, tileZ]}
                                    intensity={isMediumTier ? 5 : 8}
                                    distance={isMediumTier ? 10 : 12}
                                    decay={2.5}
                                    color="#fff5e6"
                                />
                            )}
                        </group>
                    );
                    tileZ -= tileLength;
                }
                return tiles;
            })()}

            {/* Wall Segments */}
            {[...leftSegments, ...rightSegments].map((seg, i) => (
                <group key={i} position={seg.position} rotation={[0, seg.rotationY || seg.rotation[1], 0]}>
                    <mesh>
                        <planeGeometry args={[seg.width, corridorHeight]} />
                        <meshStandardMaterial color="#dcdcdc" roughness={0.9} metalness={0.05} />
                    </mesh>
                    {/* Baseboard - Darker for realism */}
                    <mesh position={[0, -corridorHeight / 2 + 0.075, 0.01]}>
                        <planeGeometry args={[seg.width, 0.15]} />
                        <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.2} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

export default CorridorWalls;

