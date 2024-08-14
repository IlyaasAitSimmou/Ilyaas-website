import { getSession } from '@/actions'
import { redirect } from 'next/navigation'
import React from 'react'

const Profile = async () => {

  const session = await getSession()

  if (!session.logged_in) {
    redirect('/')
  }

  return (
    <div>
        <h1>Welcome to the profile page</h1>
        <p>Welcome <b>{session.username}</b></p>
        <span></span>
        <p>Here are your posts!</p>
    </div>
  )
}

export default Profile