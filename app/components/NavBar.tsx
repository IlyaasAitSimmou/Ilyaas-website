import React from 'react'
import Link from 'next/link'
import LogoutForm from './LogoutForm'
import { getSession } from '@/actions'
import styles from './NavBar.module.css'

interface NavBarProps {
    styling?: string;
}

const NavBar = async ({ styling }: NavBarProps) => {
    // const session = await getSession()
    // console.log(session)
    // console.log(session.logged_in)

    return (
        <nav className={`${styles.navbar} ${styling || ''}`}>
            <Link className={styles.navLink} href='/'>Home</Link>
            <Link className={styles.navLink} href='/about'>About Me</Link>
            <Link className={styles.navLink} href='/projects'>My projects</Link>
            <Link className={styles.navLink} href='/contact'>Contact</Link>
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