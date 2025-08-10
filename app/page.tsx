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
// import styles from "./homepage.module.css";

export default function Home() {
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
    
    const timer = setTimeout(() => {
      setTypingTextVisible(true);
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
          }, 500); // Extra delay to ensure text is visually settled
        }, 800); // Match CSS transition duration
      }, 2000)
    }, 1600); // Show text after 1 second
    
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
  }, []);
  return (
    <main className={styles.homepage}>
      {typingTextVisible && (
        <span className={
          typingTextFinal 
            ? styles.typingText2
            : typingTextTransitioning 
              ? styles.typingTextTransitioning
              : styles.typingText
        }>
          Hey! I'm Ilyaas
        </span>
      )}
      {/* Space/Rocket Section */}
      <div style={{ position: 'relative', height: '300vh', width: '100%' /* was 100vw */ }}>
        <StarryBackground />
        <ThreeJsPlanets />
        {/* <ScrollRocket /> */}
      </div>
      
      {/* Laptop Section */}
      <div style={{ position: 'relative', height: '100vh', width: '100%' /* was 100vw */ }}>
        <LaptopBackground />
      </div>

      {/* Skills Section */}
      <SkillsSection />
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