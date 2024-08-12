"use client"
import React, { useState } from 'react'
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

const Page = () => {
  const [email, setEmail] = useState('')
  const [username, setUserame] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [about, setAbout] = useState('')
  const [errorMessage, setErrorMessage] = useState('e')

  const signUp = async () => {
    if (email && username && password && confirmation) {
      if (password !== confirmation) {
        return '';
      } else {
        try {
          setErrorMessage('ewewrw')
          await sql`INSERT INTO users (email, username, description, password) VALUES (${email}, ${username}, ${about}, ${password});`;
          setErrorMessage('ewewrw')
        } catch (error) {
          console.log('error3')
          return NextResponse.json({ error }, { status: 500 });
        }
      
        const users = await sql`SELECT * FROM users;`;
        console.log(`here is ${users}`)
        return NextResponse.json({ users }, { status: 200 });
        }
      } else {
      return ''
    }
      
    }
  return (
    <div>
        <h1>Contacting me</h1>
        <h3>I am always exited to learn new things and work with new people</h3>
        <h5>You can contact me via email, instagram, Linkedin, or phone</h5>
        <h3>Or you can contact me by making an account</h3>
        <h5>Try it out. You have yet to see one of my greatest surprises</h5>
        <form action='#' onSubmit={() => {
          signUp()
          }}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='email'/>
            <input type="text" value={username} onChange={(e) => setUserame(e.target.value)} placeholder='username'/>
            <input type="password" value={password} onChange={(e) => {
              setPassword(e.target.value)
              console.log('e')
            }
              } placeholder='password'/>
            <input type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder='confirm password'/>
            <input type='text' value={about} onChange={(e) => setAbout(e.target.value)} placeholder='about'/>
            <button type='submit'>Submit</button>
        </form>
        <p>{errorMessage}</p>
    </div>
  )
}

export default Page




// , "lint": "next lint"