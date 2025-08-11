'use client'

import React from 'react'
import Link from 'next/link'
import LogoutForm from './LogoutForm'
import { getSession } from '@/actions'
import styles from './NavBar.module.css'
import { useAnimationSettings } from './AnimationSettings'

interface NavBarProps {
    styling?: string;
}

const NavBar = ({ styling }: NavBarProps) => {
    const { animationsEnabled, toggleAnimations } = useAnimationSettings()
    
    // Smooth scroll function
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        }
    }

    // const session = await getSession()
    // console.log(session)
    // console.log(session.logged_in)

    return (
        <nav className={`${styles.navbar} ${styling || ''}`}>
            <Link className={styles.navLink} href='/'>Home</Link>
            <button 
                className={styles.navLink} 
                onClick={() => scrollToSection('projects')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
                My projects
            </button>
            <button 
                className={styles.navLink} 
                onClick={() => scrollToSection('skills')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
                My skills
            </button>
            <Link className={styles.navLink} href='/contact'>Contact</Link>
            
            {/* Animation Toggle Slider */}
            <div className={styles.animationToggle}>
                <span className={styles.toggleLabel}>Animations</span>
                <label className={styles.switch}>
                    <input 
                        type="checkbox" 
                        checked={animationsEnabled}
                        onChange={(e) => toggleAnimations(e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                </label>
            </div>
            
            {/* {
                !session.logged_in && 
                <>
                    <Link href='/login'>Login</Link>
                    <Link href='/signup'>Sign Up</Link>
                </>
            } */}
            {/* {session.logged_in && 
            <>  
                <Link href='/profile'>Profile</Link>
                <Link href='/createpost'>Create Post</Link>
                <Link href='/draw'> Draw Something </Link>
                <LogoutForm/>
            </>
            } */}
        </nav>
    )
}

export default NavBar