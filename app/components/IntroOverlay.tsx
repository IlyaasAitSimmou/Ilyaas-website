'use client'

import { useEffect, useState } from 'react'
import styles from './IntroOverlay.module.css'

const IntroOverlay = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    
    const fullText = "Hey! I'm Ilyaas";
    
    useEffect(() => {
        let index = 0;
        const typingInterval = setInterval(() => {
            if (index < fullText.length) {
                setDisplayedText(fullText.slice(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(typingInterval);
                
                // Start fade out after typing is complete + 1.5 seconds
                setTimeout(() => {
                    setIsFadingOut(true);
                    
                    // Remove component after fade animation completes
                    setTimeout(() => {
                        setIsVisible(false);
                    }, 500); // Match the CSS transition duration
                }, 1500);
            }
        }, 100); // Adjust speed here (100ms per character)
        
        return () => clearInterval(typingInterval);
    }, []);

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