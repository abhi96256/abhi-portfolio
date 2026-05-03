import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { usePerformance, TIERS } from '../../context/PerformanceContext';

const Effects = () => {
    const { tier } = usePerformance();
    
    // High quality bloom
    return (
        <EffectComposer disableNormalPass>
            <Bloom 
                intensity={1.5} 
                luminanceThreshold={0.5} 
                luminanceSmoothing={0.025} 
                mipmapBlur 
            />
            <Noise opacity={0.03} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
            <ChromaticAberration offset={[0.001, 0.001]} />
        </EffectComposer>
    );
};

export default Effects;
