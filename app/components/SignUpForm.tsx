"use client"
import { useState } from 'react'

const SignUpForm = () => {
    const [email, setEmail] = useState('')
    const [username, setUserame] = useState('')
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [about, setAbout] = useState('')
    const [errorMessage, setErrorMessage] = useState('e')

    const signUp = async () => {
        const res = await fetch('/api/sign_up', {
        method: 'POST',
        body: JSON.stringify({
            email,
            username,
            password,
            confirmation,
            about
        }),
        })
        .then((res) => res.json())
        .then((resData) => {
        console.log(resData)
        if (resData.username) {
            setErrorMessage(`${resData.username}'s account was created successfully. An email has been send to ${resData.email} for verification. Do not close this tab`)
            verifyAccount(resData.username, resData.email, 'somewhere')
        } else {
            setErrorMessage(`Account was not created because ${resData.error}`)
        }
        })
    }

    const verifyAccount = async (username: string, email: string, link: string) => {
        console.log(process.env.EMAIL_HOST, process.env.EMAIL_USER, process.env.EMAIL_PASS)
        const res = await fetch('/api/emails', {
        method: 'POST',
        body: JSON.stringify({
            username,
            email,
            link
        }),
        })
        .then((res) => res.json())
        .then((resData) => {
        console.log(resData)
        if (resData.accepted) {
            setErrorMessage(resData.accepted)
        } else {
            setErrorMessage(resData.message)
        }
        })
    }
    return (
        <>
            <form onSubmit={(e) => {
                e.preventDefault()
                signUp()
                }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='email'/>
                <input type="text" value={username} onChange={(e) => setUserame(e.target.value)} placeholder='username'/>
                <input type="password" value={password} onChange={(e) => {
                    setPassword(e.target.value)
                    console.log('eEUQEIRHUWIQHFUIQWFOIQJFUROQJJFIOQJFEIOJFQOIJEOIQJFQIO')
                }
                    } placeholder='password'/>
                <input type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder='confirm password'/>
                <input type='text' value={about} onChange={(e) => setAbout(e.target.value)} placeholder='about'/>
                <button type='submit'>Submit</button>
            </form>
            <p>{errorMessage}</p>
        </>
  )
}

export default SignUpForm