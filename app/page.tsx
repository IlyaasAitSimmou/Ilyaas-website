'use client'
import styles from "./homepage.module.css";
// import "./homepage.css";
import SymbolParagraphs from "./components/SymbolParagraphs";
import nextjsimg from '../public/nextjs.webp'
import reactjsimg from '../public/reactjs.png'
import Typescriptimg from '../public/Typescript.png'
import Link from "next/link";
import { useEffect, useState } from "react";
import StarryBackground from "./components/StarryBackground";
import ThreeJsPlanets from "./components/ThreeJsPlanets";
import ScrollRocket from "./components/ScrollRocket";
import LaptopBackground from "./components/laptopBackground";
import SkillsSection from "./components/SkillsSection";
import MobileProjectsSection from "./components/MobileProjectsSection";
import { useAnimationSettings, ANIMATION_TIMINGS, getTotalAnimationDuration } from "./components/AnimationSettings";
// import styles from "./homepage.module.css";

export default function Home() {
  const { animationsEnabled } = useAnimationSettings()
  const [typingTextVisible, setTypingTextVisible] = useState(false);
  const [typingTextTransitioning, setTypingTextTransitioning] = useState(false);
  const [typingTextFinal, setTypingTextFinal] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  
  useEffect(() => {
    // Reset scroll position to top on page load/reload
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      // Also reset any saved scroll restoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
    }
    
    // If animations are disabled, skip the intro sequence
    if (!animationsEnabled) {
      setTypingTextVisible(true);
      setTypingTextTransitioning(true);
      setTypingTextFinal(true);
      setIntroComplete(true);
      return;
    }
    
    // Prevent scrolling during the entire intro sequence (multiple methods for cross-browser compatibility)
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // Prevent touch scroll on mobile and wheel scroll
    const preventTouchScroll = (e: TouchEvent) => {
      e.preventDefault();
    };
    
    const preventWheelScroll = (e: WheelEvent) => {
      e.preventDefault();
    };
    
    document.addEventListener('touchmove', preventTouchScroll, { passive: false });
    document.addEventListener('wheel', preventWheelScroll, { passive: false });
    
    // Use synchronized timing constants
    const timer = setTimeout(() => {
      setTypingTextVisible(true);
      
      // Calculate typing duration based on text length
      const typingDuration = ANIMATION_TIMINGS.TYPING_SPEED * "Hey! I'm Ilyaas".length;
      
      setTimeout(() => {
        // Start transition animation
        setTypingTextTransitioning(true);
        // Switch to absolute positioning after transition completes
        setTimeout(() => {
          setTypingTextFinal(true);
          // Wait a bit longer before allowing scroll to ensure text is fully settled
          setTimeout(() => {
            setIntroComplete(true);
            // Re-enable scrolling after typing text is fully settled
            document.body.style.overflow = originalOverflow;
            document.body.style.position = originalPosition;
            document.body.style.width = '';
            document.body.style.height = '';
            document.removeEventListener('touchmove', preventTouchScroll);
            document.removeEventListener('wheel', preventWheelScroll);
          }, ANIMATION_TIMINGS.FINAL_SETTLE_DELAY);
        }, ANIMATION_TIMINGS.TRANSITION_DURATION);
      }, typingDuration + ANIMATION_TIMINGS.TYPING_COMPLETE_DELAY);
    }, ANIMATION_TIMINGS.INTRO_DELAY);
    
    return () => {
      clearTimeout(timer);
      // Cleanup: ensure scrolling is re-enabled if component unmounts
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
      document.body.style.height = '';
      document.removeEventListener('touchmove', preventTouchScroll);
      document.removeEventListener('wheel', preventWheelScroll);
    };
  }, [animationsEnabled]);
  return (
    <main className={styles.homepage}>
      {/* Animated title - only show when animations are enabled */}
      {animationsEnabled && typingTextVisible && (
        <span className={
          typingTextFinal 
            ? styles.typingText2
            : typingTextTransitioning 
              ? styles.typingTextTransitioning
              : styles.typingText
        }>
          Hey! I&apos;m Ilyaas
        </span>
      )}
      
      {/* Static title - only show when animations are disabled */}
      {!animationsEnabled && (
        <span className={styles.typingText2}>
          Hey! I&apos;m Ilyaas
        </span>
      )}
      {/* Space/Rocket Section */}
      <div style={{ position: 'relative', height: '300vh', width: '100%' /* was 100vw */ }}>
        <StarryBackground />
        <ThreeJsPlanets />
        {/* <ScrollRocket /> */}
      </div>
      
      {/* Laptop Section - Hidden on phones */}
      <div id="projects" style={{ position: 'relative', width: '100%' }}>
        {/* Projects Header */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Projects</h2>
          <p className={styles.sectionSubtitle}>Check out some cool stuff I&apos;ve created or collaborated on!</p>
        </div>
        
        {/* Laptop Background - Hidden on phones */}
        <div style={{ position: 'relative', height: '150vh', width: '100%' }} className={styles.laptopOnly}>
          <LaptopBackground />
        </div>
        
        {/* Mobile Projects Section - Only shown on phones */}
        <div className={styles.mobileOnly}>
          <MobileProjectsSection />
        </div>
      </div>

      {/* Skills Section */}
      <div id="skills">
        <SkillsSection />
      </div>
    </main>
  );
}


{/* <h1 className="header 1">Ilyaas&apos; Website</h1>
      {/* <h3 className="header 2">Coded with Next.js and React with TypeScript</h3> */}
    //   <SymbolParagraphs text={'Coded with ? and ? with ?'} 
    //   imageList={
    //     [{image: nextjsimg, height: 30, width: 30, padding: '10px', alt: 'Next.js'}, 
    //     {image: reactjsimg, height: 38, width: 57, alt: 'React'}, 
    //     {image: Typescriptimg, height: 25, width: 25, padding: '10px', alt: 'TypeScript'}
    //   ]
    // } 
    //   pgheight='5vh' pgwidth='28vw' textStyles={{fontSize: '1.5rem'}}/>
    //   <Link href='/about'>
    //     Who am I
    //   </Link>
    //   <Link href='/projects'>
    //     What I&apos;ve done
    //   </Link> */}