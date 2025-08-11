'use client'

import { useEffect, useState } from 'react'
import styles from './IntroOverlay.module.css'
import { useAnimationSettings, ANIMATION_TIMINGS } from './AnimationSettings'

const IntroOverlay = () => {
    const { animationsEnabled } = useAnimationSettings()
    const [isVisible, setIsVisible] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    
    const fullText = "Hey! I'm Ilyaas";
    
    useEffect(() => {
        // If animations are disabled, don't show the overlay
        if (!animationsEnabled) {
            setIsVisible(false);
            return;
        }

        let index = 0;
        const typingInterval = setInterval(() => {
            if (index < fullText.length) {
                setDisplayedText(fullText.slice(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(typingInterval);
                
                // Start fade out after typing is complete using synchronized timing
                setTimeout(() => {
                    setIsFadingOut(true);
                    
                    // Remove component after fade animation completes
                    setTimeout(() => {
                        setIsVisible(false);
                    }, ANIMATION_TIMINGS.FADE_DURATION);
                }, ANIMATION_TIMINGS.TYPING_COMPLETE_DELAY);
            }
        }, ANIMATION_TIMINGS.TYPING_SPEED);
        
        return () => {
            clearInterval(typingInterval);
        };
    }, [animationsEnabled]);

    if (!isVisible) return null;

    return (
        <div className={`${styles.overlay} ${isFadingOut ? styles.fadeOut : ''}`}>
            <div className={styles.typingContainer}>
                <span className={`${styles.typingText} ${isTyping ? styles.typing : styles.finished}`}>
                    {displayedText}
                </span>
            </div>
        </div>
    );
};

export default IntroOverlay