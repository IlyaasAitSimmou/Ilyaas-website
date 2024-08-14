import React from 'react'
import Link from 'next/link'
import LogoutForm from './LogoutForm'
import { getSession } from '@/actions'

const NavBar = async () => {
    const session = await getSession()
    console.log(session)
    console.log(session.logged_in)

    return (
        <nav>
            <Link href='/'>Home</Link>
            <Link href='/about'>About Me</Link>
            <Link href='/projects'>My projects</Link>
            <Link href='/contact'>Contact</Link>
            {
                !session.logged_in && 
                <>
                    <Link href='/login'>Login</Link>
                    <Link href='/signup'>Sign Up</Link>
                </>
            }
            {session.logged_in && 
            <>  
                <Link href='/profile'>Profile</Link>
                <Link href='/createpost'>Create Post</Link>
                <LogoutForm/>
            </>
            }
        </nav>
    )
}

export default NavBar