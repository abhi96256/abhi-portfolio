/* eslint-disable react/no-unknown-property */
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture, Html, useCursor } from '@react-three/drei';
import * as THREE from 'three';

const PAPER_WIDTH = 1.51; 
const PAPER_HEIGHT = 1.7;
const FONT_PATH = '/fonts/CabinSketch-Regular.ttf';

// Visual-only component for the text fields
const VisualTextField = ({
    isActive,
    value,
    placeholder,
    cursor,
    position,
    baseRotation,
    fontSize,
    maxWidth,
    anchorX = 'left',
    anchorY = 'middle',
    fontPath,
    textAlign,
    lineHeight
}) => {
    return (
        <Text
            position={position}
            rotation={baseRotation}
            fontSize={fontSize}
            color="#333333"
            font={fontPath}
            anchorX={anchorX}
            anchorY={anchorY}
            maxWidth={maxWidth}
            textAlign={textAlign}
            lineHeight={lineHeight}
        >
            {isActive ? (value + cursor) : (value || placeholder)}
        </Text>
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
                <meshBasicMaterial color="#e0e0e0" map={texture} transparent alphaTest={0.1} />
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

const FORMSPREE_URL = 'https://formspree.io/f/mojrjnwd';

const MessagePaper = ({ position = [0, 0.05, 2], onSend }) => {
    const groupRef = useRef();
    const paperRef = useRef();

    // Form State
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [activeField, setActiveField] = useState(null);
    const [cursorVisible, setCursorVisible] = useState(true);

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const paperTexture = useTexture('/textures/contact/paper_form.webp');
    const buttonTexture = useTexture('/textures/contact/send_button.webp');

    useEffect(() => {
        if (paperTexture) paperTexture.colorSpace = THREE.SRGBColorSpace;
        if (buttonTexture) buttonTexture.colorSpace = THREE.SRGBColorSpace;
    }, [paperTexture, buttonTexture]);

    useEffect(() => {
        if (!activeField) { setCursorVisible(false); return; }
        const interval = setInterval(() => setCursorVisible(prev => !prev), 530);
        return () => clearInterval(interval);
    }, [activeField]);

    const validateForm = () => {
        const newErrors = {};
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Valid email required';
        if (!subject.trim()) newErrors.subject = 'Subject required';
        if (!message.trim()) newErrors.message = 'Message required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleButtonClick = useCallback(async () => {
        setSubmitStatus(null);
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(FORMSPREE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email, subject, message })
            });
            if (response.ok) {
                setSubmitStatus('success');
                onSend?.({ message, email, subject });
                setMessage(''); setEmail(''); setSubject('');
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    }, [message, email, subject, onSend]);

    const formattedMessage = useMemo(() => {
        const maxCharsPerLine = 28;
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
        return lines.slice(0, 10).join('\n');
    }, [message]);

    useFrame((state) => {
        if (!paperRef.current) return;
        paperRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.005;
    });

    if (submitStatus === 'success') {
        return (
            <group position={position}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[PAPER_WIDTH, PAPER_HEIGHT]} />
                    <meshBasicMaterial color="#f5f5f0" map={paperTexture} transparent alphaTest={0.5} />
                </mesh>
                <Text position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.08} color="#22aa44" font={FONT_PATH} anchorX="center" anchorY="middle">
                    SUCCESSFULLY SENT! ✓
                </Text>
            </group>
        );
    }

    return (
        <group ref={groupRef} position={position}>
            {/* Single HTML Overlay Layer */}
            <Html
                transform
                position={[0, 0.018, 0]} // Slightly higher to ensure it's on top
                rotation={[-Math.PI / 2, 0, 0]}
                scale={0.1}
            >
                <div style={{
                    width: PAPER_WIDTH * 1000 + 'px',
                    height: PAPER_HEIGHT * 1000 + 'px',
                    position: 'relative',
                    pointerEvents: 'none' // The wrapper itself doesn't block clicks
                }}>
                    {/* Email Input Overlay */}
                    <input 
                        type="email"
                        autoComplete="off"
                        spellCheck="false"
                        style={{
                            position: 'absolute',
                            top: '8%',
                            left: '5%',
                            width: '90%',
                            height: '11%',
                            opacity: 0,
                            pointerEvents: 'auto', // This input DOES catch clicks
                            fontSize: '60px',
                            cursor: 'text'
                        }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value.slice(0, 50))}
                        onFocus={() => setActiveField('email')}
                        onBlur={() => setActiveField(null)}
                    />
                    {/* Subject Input Overlay */}
                    <input 
                        type="text"
                        autoComplete="off"
                        spellCheck="false"
                        style={{
                            position: 'absolute',
                            top: '19%',
                            left: '5%',
                            width: '90%',
                            height: '11%',
                            opacity: 0,
                            pointerEvents: 'auto',
                            fontSize: '60px',
                            cursor: 'text'
                        }}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value.slice(0, 50))}
                        onFocus={() => setActiveField('subject')}
                        onBlur={() => setActiveField(null)}
                    />
                    {/* Message Input Overlay */}
                    <textarea 
                        autoComplete="off"
                        spellCheck="false"
                        style={{
                            position: 'absolute',
                            top: '32%',
                            left: '5%',
                            width: '90%',
                            height: '42%',
                            opacity: 0,
                            pointerEvents: 'auto',
                            fontSize: '60px',
                            resize: 'none',
                            cursor: 'text'
                        }}
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, 300))}
                        onFocus={() => setActiveField('message')}
                        onBlur={() => setActiveField(null)}
                    />
                </div>
            </Html>

            <mesh ref={paperRef} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[PAPER_WIDTH, PAPER_HEIGHT, 20, 20]} />
                <meshBasicMaterial color="#e0e0e0" map={paperTexture} transparent alphaTest={0.5} roughness={0.9} />
            </mesh>

            <VisualTextField
                isActive={activeField === 'email'}
                value={email}
                placeholder="email..."
                cursor={cursorVisible ? '|' : ' '}
                position={[-0.5, 0.008, -0.61]}
                baseRotation={[-Math.PI / 2, 0, 0.02]}
                fontSize={0.05}
                maxWidth={PAPER_WIDTH * 0.8}
                fontPath={FONT_PATH}
            />

            <VisualTextField
                isActive={activeField === 'subject'}
                value={subject}
                placeholder="subject..."
                cursor={cursorVisible ? '|' : ' '}
                position={[-0.5, 0.008, -0.46]}
                baseRotation={[-Math.PI / 2, 0, 0.02]}
                fontSize={0.05}
                maxWidth={PAPER_WIDTH * 0.8}
                fontPath={FONT_PATH}
            />

            <VisualTextField
                isActive={activeField === 'message'}
                value={formattedMessage}
                placeholder="message..."
                cursor={cursorVisible ? '|' : ' '}
                position={[-0.46, 0.008, -0.3]}
                baseRotation={[-Math.PI / 2, 0, 0.02]}
                fontSize={0.045}
                maxWidth={PAPER_WIDTH * 0.75}
                fontPath={FONT_PATH}
                anchorY="top"
                textAlign="left"
                lineHeight={1.35}
            />

            <SmoothButton texture={buttonTexture} onClick={handleButtonClick} position={[0, 0.005, 0.68]} size={[0.5, 0.13]} text={isSubmitting ? 'SENDING...' : 'SEND'} fontPath={FONT_PATH} />

            {Object.keys(errors).length > 0 && (
                <Text position={[0, 0.01, 0.55]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.035} color="#cc3333" font={FONT_PATH} anchorX="center" anchorY="middle">
                    {errors.email || errors.subject || errors.message || 'Required'}
                </Text>
            )}
        </group>
    );
};

export default MessagePaper;
