import styles from "./homepage.module.css";
// import "./homepage.css";
import SymbolParagraphs from "./components/SymbolParagraphs";
import nextjsimg from '../public/nextjs.webp'
import reactjsimg from '../public/reactjs.png'
import Typescriptimg from '../public/Typescript.png'
import Link from "next/link";
import StarryBackground from "./components/StarryBackground";
import ThreeJsPlanets from "./components/ThreeJsPlanets";
import ScrollRocket from "./components/ScrollRocket";
import LaptopBackground from "./components/laptopBackground";
import SkillsSection from "./components/SkillsSection";
// import styles from "./homepage.module.css";

export default function Home() {
  return (
    <main className={styles.homepage}>
      {/* Space/Rocket Section */}
      <div style={{ position: 'relative', height: '300vh', width: '100vw' }}>
        <StarryBackground />
        <ThreeJsPlanets />
        {/* <ScrollRocket /> */}
      </div>
      
      {/* Laptop Section */}
      <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
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