'use client'

import { useEffect, useState } from 'react'

// Animation settings management
export const useAnimationSettings = () => {
    const [animationsEnabled, setAnimationsEnabled] = useState(true)

    useEffect(() => {
        // Load from localStorage on client side
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('portfolioAnimationsEnabled')
            if (saved !== null) {
                setAnimationsEnabled(JSON.parse(saved))
            }
        }
    }, [])

    const toggleAnimations = (enabled: boolean) => {
        setAnimationsEnabled(enabled)
        if (typeof window !== 'undefined') {
            localStorage.setItem('portfolioAnimationsEnabled', JSON.stringify(enabled))
        }
    }

    return { animationsEnabled, toggleAnimations }
}

// Animation timing constants - synchronized across components
export const ANIMATION_TIMINGS = {
    INTRO_DELAY: 1600,           // Initial delay before typing starts
    TYPING_SPEED: 100,           // ms per character
    TYPING_COMPLETE_DELAY: 1500, // Delay after typing before fade
    FADE_DURATION: 500,          // Fade out duration
    TRANSITION_DURATION: 800,    // Blue text transition duration
    FINAL_SETTLE_DELAY: 500      // Final delay before enabling scroll
}

// Calculate total animation duration
export const getTotalAnimationDuration = () => {
    const typingDuration = ANIMATION_TIMINGS.TYPING_SPEED * "Hey! I'm Ilyaas".length
    return ANIMATION_TIMINGS.INTRO_DELAY + 
           typingDuration + 
           ANIMATION_TIMINGS.TYPING_COMPLETE_DELAY + 
           ANIMATION_TIMINGS.TRANSITION_DURATION + 
           ANIMATION_TIMINGS.FINAL_SETTLE_DELAY
}
