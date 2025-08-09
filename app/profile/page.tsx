"use server"
import { getSession, getUserPosts } from '@/actions'
import { redirect } from 'next/navigation'
import React from 'react'
import { sql } from '@vercel/postgres'


const Profile = async () => {

  const session = await getSession()
  const posts = await getUserPosts(session)


  if (!session.logged_in) {
    redirect('/')
  }

  return (
    <div>
        <h1>Welcome to the profile page</h1>
        <p>Welcome <b>{session.username}</b></p>
        <span></span>
        {posts.map(post => <>
          <p>subject: {post.subject}</p>
          <p>message: {post.message}</p>
        </>)}
    </div>
  )
}

export default Profile