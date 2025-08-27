'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './StarryBackground.module.css'
import ScrollRocket from './ScrollRocket'

const StarryBackground = () => {
    const starsRef = useRef<HTMLDivElement>(null)
    const cloudsRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [backgroundTransition, setBackgroundTransition] = useState(0)
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [isWordVisible, setIsWordVisible] = useState(true)

    // Words to cycle through
    const cyclingWords = [
        'astronomy', 'aviation', 'rockets', 'cars',
        'robotics', 'arduino', 'lego', 'coding', 'game dev', 'web dev', 'AI'
    ]

    useEffect(() => {
        const createStars = () => {
            if (!starsRef.current) return

            const numberOfStars = 200
            const container = starsRef.current

            for (let i = 0; i < numberOfStars; i++) {
                const star = document.createElement('div')
                star.className = styles.star

                // Random position
                star.style.left = Math.random() * 100 + '%'
                star.style.top = Math.random() * 100 + '%'

                // Random size (small variation for cartoonish effect)
                const size = Math.random() * 3 + 1
                star.style.width = size + 'px'
                star.style.height = size + 'px'

                // Random animation delay for twinkling
                star.style.animationDelay = Math.random() * 3 + 's'

                // Random animation duration for variety
                star.style.animationDuration = (Math.random() * 2 + 2) + 's'

                container.appendChild(star)
            }
        }

        const createClouds = () => {
            if (!cloudsRef.current) return

            const numberOfClouds = 20
            const container = cloudsRef.current

            for (let i = 0; i < numberOfClouds; i++) {
                const cloud = document.createElement('div')
                cloud.className = styles.cloud

                // Random position
                cloud.style.left = Math.random() * 120 + '%' // Extend beyond view for animation
                cloud.style.top = Math.random() * 60 + 20 + '%' // Keep in sky area

                // Random size
                const size = Math.random() * 100 + 80
                cloud.style.width = size + 'px'
                cloud.style.height = size * 0.6 + 'px'

                // Random animation delay and duration
                cloud.style.animationDelay = Math.random() * 20 + 's'
                cloud.style.animationDuration = (Math.random() * 30 + 40) + 's'

                container.appendChild(cloud)
            }
        }

        createStars()
        createClouds()

        // Handle scroll for background transition
        const handleScroll = () => {
            if (!containerRef.current) return

            const rect = containerRef.current.getBoundingClientRect()
            const scrollY = Math.max(0, -rect.top) // How much starry background has scrolled past viewport top
            const maxScroll = containerRef.current.offsetHeight - window.innerHeight
            const scrollProgress = Math.min(scrollY / maxScroll, 1)

            // Start transition at 70% of scroll through the starry background section
            const transitionStart = 0.7
            let transition = 0

            if (scrollProgress > transitionStart) {
                transition = (scrollProgress - transitionStart) / (1 - transitionStart)
            }

            setBackgroundTransition(transition)
        }

        window.addEventListener('scroll', handleScroll)

        // Cleanup function
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (starsRef.current) {
                starsRef.current.innerHTML = ''
            }
            if (cloudsRef.current) {
                cloudsRef.current.innerHTML = ''
            }
        }
    }, [])

    // Word cycling effect
    useEffect(() => {
        const cycleWords = () => {
            setIsWordVisible(false) // Start fade out

            setTimeout(() => {
                setCurrentWordIndex((prevIndex) =>
                    (prevIndex + 1) % cyclingWords.length
                )
                setIsWordVisible(true) // Start fade in
            }, 500) // Wait for fade out to complete
        }

        const intervalId = setInterval(cycleWords, 1500) // Change word every 2.5 seconds

        return () => clearInterval(intervalId)
    }, [cyclingWords.length])


    return (
        <div ref={containerRef} className={styles.starryBackground}>
            {/* Title layer */}
            <div
                className={styles.titleContainer}
                style={{ opacity: 1 - backgroundTransition }}
            >
                <h1 className={styles.title}>
                    I'm passionate about{' '}
                    <span
                        className={`${styles.cyclingWord} ${!isWordVisible ? styles.fadeOut : ''}`}
                    >
                        {cyclingWords[currentWordIndex]}
                    </span>
                </h1>
            </div>

            {/* Stars layer */}
            <div
                ref={starsRef}
                className={styles.starsContainer}
                style={{ opacity: 1 - backgroundTransition }}
            ></div>

            {/* Sky transition overlay */}
            <div
                className={styles.skyOverlay}
                style={{ opacity: backgroundTransition }}
            ></div>

            {/* Clouds layer */}
            <div
                ref={cloudsRef}
                className={styles.cloudsContainer}
                style={{ opacity: backgroundTransition }}
            ></div>
            <ScrollRocket containerRef={containerRef} />
        </div>
    )
}

export default StarryBackground
