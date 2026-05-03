/* eslint-disable react/no-unknown-property */
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture, Html, useCursor } from '@react-three/drei';
import * as THREE from 'three';

const PAPER_WIDTH = 1.51; // Legacy ratio 1197/1340
const PAPER_HEIGHT = 1.7;
const FONT_PATH = '/fonts/CabinSketch-Regular.ttf';

// Helper: Interactive Text Field with Native DOM Input for Mobile Compatibility
const InteractiveTextField = ({
    isActive,
    value,
    placeholder,
    cursor,

    // Layout props
    position,
    baseRotation,
    hitboxPosition,
    hitboxSize,

    // Style props
    fontSize,
    maxWidth,
    anchorX = 'left',
    anchorY = 'middle',
    fontPath,
    textAlign,
    lineHeight,

    // Input props
    type = 'text',
    onChange,
    onFocus,
    onBlur
}) => {
    const textRef = useRef();
    const inputRef = useRef();
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    // Animation targets
    const targetY = hovered ? position[1] + 0.007 : position[1];
    const targetRotZ = hovered ? baseRotation[2] + 0.015 : baseRotation[2];

    useFrame((state, delta) => {
        const t = delta * 12;
        if (textRef.current) {
            textRef.current.position.y = THREE.MathUtils.lerp(textRef.current.position.y, targetY, t);
            textRef.current.rotation.z = THREE.MathUtils.lerp(textRef.current.rotation.z, targetRotZ, t);
        }
    });

    return (
        <group
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={(e) => {
                e.stopPropagation();
                if (inputRef.current) inputRef.current.focus();
            }}
        >
            {/* Invisible solid hitbox to ensure the whole field area is clickable */}
            <mesh 
                position={[hitboxPosition[0] - position[0], 0, hitboxPosition[2] - position[2]]} 
                rotation={[-Math.PI / 2, 0, 0]}
                visible={false}
            >
                <planeGeometry args={hitboxSize} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Native DOM Input Overlay for Keyboard Trigger */}
            <Html
                transform
                position={[hitboxPosition[0], hitboxPosition[1] + 0.02, hitboxPosition[2]]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={0.01}
            >
                <div style={{
                    width: (hitboxSize[0] * 100) + 'px',
                    height: (hitboxSize[1] * 100) + 'px',
                    position: 'relative',
                    pointerEvents: 'auto'
                }}>
                    {type === 'textarea' ? (
                        <textarea
                            ref={inputRef}
                            name="message"
                            value={value}
                            onChange={onChange}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            placeholder={placeholder}
                            style={{
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: '64px',
                                resize: 'none',
                                padding: '10px',
                                caretColor: 'transparent'
                            }}
                        />
                    ) : (
                        <input
                            ref={inputRef}
                            name={placeholder.replace('...', '')}
                            type={type}
                            value={value}
                            onChange={onChange}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            placeholder={placeholder}
                            style={{
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: '64px',
                                padding: '10px',
                                caretColor: 'transparent'
                            }}
                        />
                    )}
                </div>
            </Html>

            <Text
                renderOrder={1}
                ref={textRef}
                position={position}
                rotation={baseRotation}
                fontSize={fontSize}
                color={hovered ? '#111111' : '#333333'}
                font={fontPath}
                anchorX={anchorX}
                anchorY={anchorY}
                maxWidth={maxWidth}
                textAlign={textAlign}
                lineHeight={lineHeight}
            >
                {isActive ? (value + cursor) : (value || placeholder)}
            </Text>
        </group>
    );
};

// Helper: Smooth Animated Button
const SmoothButton = ({ texture, onClick, position, size, text, fontPath }) => {
    const groupRef = useRef();
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    const targetY = hovered ? position[1] + 0.007 : position[1];
    const targetRotZ = hovered ? 0.015 : 0;

    useFrame((state, delta) => {
        const t = delta * 12;
        if (groupRef.current) {
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, t);
            groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, t);
        }
    });

    return (
        <group
            ref={groupRef}
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                onClick && onClick();
            }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={size} />
                <meshBasicMaterial color="#e0e0e0"
                    map={texture}
                    transparent
                    alphaTest={0.1}
                />
            </mesh>
            {text && (
                <Text
                    renderOrder={1}
                    position={[0, 0.005, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.06}
                    color="#333333"
                    font={fontPath}
                    anchorX="center"
                    anchorY="middle"
                >
                    {text}
                </Text>
            )}
        </group>
    );
};

// Formspree URL
const FORMSPREE_URL = 'https://formspree.io/f/mojrjnwd';

const MessagePaper = ({ position = [0, 0.05, 2], onSend }) => {
    const groupRef = useRef();
    const paperRef = useRef();
    const backPaperRef = useRef();

    // Form State
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [activeField, setActiveField] = useState(null);
    const [cursorVisible, setCursorVisible] = useState(true);

    // Validation & Submit State
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    // Email validation helper
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = 'Email required';
        else if (!isValidEmail(email)) newErrors.email = 'Invalid email format';
        if (!subject.trim()) newErrors.subject = 'Subject required';
        if (!message.trim()) newErrors.message = 'Message required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Load textures
    const paperTexture = useTexture('/textures/contact/paper_form.webp');
    const buttonTexture = useTexture('/textures/contact/send_button.webp');

    useEffect(() => {
        if (paperTexture) paperTexture.colorSpace = THREE.SRGBColorSpace;
        if (buttonTexture) buttonTexture.colorSpace = THREE.SRGBColorSpace;
    }, [paperTexture, buttonTexture]);

    // Cursor blink effect
    useEffect(() => {
        if (!activeField) {
            setCursorVisible(false);
            return;
        }
        const interval = setInterval(() => setCursorVisible(prev => !prev), 530);
        return () => clearInterval(interval);
    }, [activeField]);

    // Handle send button click
    const handleButtonClick = useCallback(async () => {
        setSubmitStatus(null);
        if (!validateForm()) return;
        setIsSubmitting(true);
        setErrors({});

        try {
            const response = await fetch(FORMSPREE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, subject, message })
            });

            if (response.ok) {
                setSubmitStatus('success');
                onSend?.({ message, email, subject });
                setMessage('');
                setEmail('');
                setSubject('');
            } else {
                const result = await response.json();
                throw new Error(result.error || 'Failed to send');
            }
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    }, [message, email, subject, onSend]);

    // Word wrap message for 3D text display
    const formattedMessage = useMemo(() => {
        const maxCharsPerLine = 28;
        const maxLines = 10;
        const lines = [];
        const words = message.split(' ');
        let currentLine = '';

        words.forEach(word => {
            if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
                currentLine = (currentLine + ' ' + word).trim();
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });
        if (currentLine) lines.push(currentLine);
        return lines.slice(0, maxLines).join('\n');
    }, [message]);

    // Paper animation (flutter)
    useFrame((state, delta) => {
        if (!paperRef.current) return;
        const time = state.clock.getElapsedTime();
        paperRef.current.rotation.z = Math.sin(time * 0.5) * 0.005;
    });

    if (submitStatus === 'success') {
        return (
            <group ref={groupRef} position={position}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[PAPER_WIDTH, PAPER_HEIGHT]} />
                    <meshBasicMaterial color="#f5f5f0" map={paperTexture} transparent alphaTest={0.5} />
                </mesh>
                <Text
                    position={[0, 0.02, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.08}
                    color="#22aa44"
                    font={FONT_PATH}
                    anchorX="center"
                    anchorY="middle"
                >
                    SUCCESSFULLY SENT! ✓
                </Text>
            </group>
        );
    }

    return (
        <group ref={groupRef} position={position}>
            {/* Main Paper Mesh */}
            <mesh ref={paperRef} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[PAPER_WIDTH, PAPER_HEIGHT, 20, 20]} />
                <meshBasicMaterial color="#e0e0e0" map={paperTexture} transparent alphaTest={0.5} side={THREE.FrontSide} roughness={0.9} />
            </mesh>

            {/* Paper BACK */}
            <mesh ref={backPaperRef} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[PAPER_WIDTH, PAPER_HEIGHT, 20, 20]} />
                <meshBasicMaterial color="#f5f5f0" side={THREE.BackSide} roughness={0.9} />
            </mesh>

            {/* Email Field */}
            <InteractiveTextField
                isActive={activeField === 'email'}
                value={email}
                placeholder="email..."
                cursor={cursorVisible ? '|' : ' '}
                type="email"
                onChange={(e) => setEmail(e.target.value.slice(0, 50))}
                onFocus={() => setActiveField('email')}
                onBlur={() => setActiveField(null)}
                position={[-0.5, 0.008, -0.61]}
                baseRotation={[-Math.PI / 2, 0, 0.02]}
                hitboxPosition={[0, 0.005, -0.61]}
                hitboxSize={[PAPER_WIDTH * 0.85, 0.08]}
                fontSize={0.05}
                maxWidth={PAPER_WIDTH * 0.8}
                fontPath={FONT_PATH}
            />

            {/* Subject Field */}
            <InteractiveTextField
                isActive={activeField === 'subject'}
                value={subject}
                placeholder="subject..."
                cursor={cursorVisible ? '|' : ' '}
                type="text"
                onChange={(e) => setSubject(e.target.value.slice(0, 50))}
                onFocus={() => setActiveField('subject')}
                onBlur={() => setActiveField(null)}
                position={[-0.5, 0.008, -0.46]}
                baseRotation={[-Math.PI / 2, 0, 0.02]}
                hitboxPosition={[0, 0.005, -0.46]}
                hitboxSize={[PAPER_WIDTH * 0.85, 0.08]}
                fontSize={0.05}
                maxWidth={PAPER_WIDTH * 0.8}
                fontPath={FONT_PATH}
            />

            {/* Message Field */}
            <InteractiveTextField
                isActive={activeField === 'message'}
                value={formattedMessage}
                placeholder="message..."
                cursor={cursorVisible ? '|' : ' '}
                type="textarea"
                onChange={(e) => setMessage(e.target.value.slice(0, 300))}
                onFocus={() => setActiveField('message')}
                onBlur={() => setActiveField(null)}
                position={[-0.46, 0.008, -0.3]}
                baseRotation={[-Math.PI / 2, 0, 0.02]}
                hitboxPosition={[0, 0.005, -0.025]}
                hitboxSize={[PAPER_WIDTH * 0.85, 0.55]}
                fontSize={0.045}
                maxWidth={PAPER_WIDTH * 0.75}
                fontPath={FONT_PATH}
                anchorY="top"
                textAlign="left"
                lineHeight={1.35}
            />

            {/* SEND BUTTON */}
            <SmoothButton
                texture={buttonTexture}
                onClick={handleButtonClick}
                position={[0, 0.005, 0.68]}
                size={[0.5, 0.13]}
                text={isSubmitting ? 'SENDING...' : 'SEND'}
                fontPath={FONT_PATH}
            />

            {/* VALIDATION ERRORS */}
            {Object.keys(errors).length > 0 && (
                <Text
                    position={[0, 0.01, 0.55]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.035}
                    color="#cc3333"
                    font={FONT_PATH}
                    anchorX="center"
                    anchorY="middle"
                >
                    {errors.email || errors.subject || errors.message || 'Please fill all fields'}
                </Text>
            )}

            {/* ERROR MESSAGE */}
            {submitStatus === 'error' && (
                <Text
                    position={[0, 0.02, 0.55]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.04}
                    color="#cc3333"
                    font={FONT_PATH}
                    anchorX="center"
                    anchorY="middle"
                >
                    Failed to send. Try again.
                </Text>
            )}
        </group>
    );
};

export default MessagePaper;
