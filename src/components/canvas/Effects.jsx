import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { usePerformance, TIERS } from '../../context/PerformanceContext';

const Effects = () => {
    const { tier } = usePerformance();
    
    // Disable effects on low tier for performance
    if (tier === TIERS.LOW) return null;

    return (
        <EffectComposer disableNormalPass>
            <Bloom 
                intensity={1.0} 
                luminanceThreshold={0.9} 
                luminanceSmoothing={0.025} 
                mipmapBlur 
            />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
            <ChromaticAberration offset={[0.0005, 0.0005]} />
        </EffectComposer>
    );
};

export default Effects;
