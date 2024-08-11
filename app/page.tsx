import styles from "./page.module.css";
import "./homepage.css";
import SymbolParagraphs from "./components/SymbolParagraphs";
import nextjsimg from '../public/nextjs.webp'
import reactjsimg from '../public/reactjs.png'
import Typescriptimg from '../public/Typescript.png'
import Link from "next/link";

export default function Home() {
  return (
    <main className="home_body">
      <h1 className="header 1">Ilyaas' Website</h1>
      {/* <h3 className="header 2">Coded with Next.js and React with TypeScript</h3> */}
      <SymbolParagraphs text={'Coded with ? and ? with ?'} 
      imageList={
        [{image: nextjsimg, height: 30, width: 30, padding: '10px', alt: 'Next.js'}, 
        {image: reactjsimg, height: 38, width: 57, alt: 'React'}, 
        {image: Typescriptimg, height: 25, width: 25, padding: '10px', alt: 'TypeScript'}
      ]
    } 
      pgheight='5vh' pgwidth='28vw' textStyles={{fontSize: '1.5rem'}}/>
      <Link href='/about'>
        Who am I
      </Link>
      <Link href='/projects'>
        What I've done
      </Link>
    </main>

  );
}
