import { useAudio } from '../../context/AudioManager';
import '../../styles/AudioControls.scss';

const AudioControls = () => {
    const { isMuted, toggleMute, globalVolume, setGlobalVolume } = useAudio();

    // Professional SVG Icons
    const SoundOnIcon = () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a9 9 0 0 1 0 12.72" />
        </svg>
    );

    const SoundOffIcon = () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
            <path d="M23 9l-6 6M17 9l6 6" strokeWidth="2.5" />
        </svg>
    );

    return (
        <div className="audio-controls">
            {/* Volume Slider - Revealed on Hover via CSS */}
            <div className="volume-slider-container">
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={globalVolume}
                    onChange={(e) => setGlobalVolume(parseFloat(e.target.value))}
                    aria-label="Volume"
                />
            </div>

            {/* Mute Toggle Button */}
            <button
                className="mute-btn"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted || globalVolume === 0 ? <SoundOffIcon /> : <SoundOnIcon />}
            </button>
        </div>
    );
};

export default AudioControls;
