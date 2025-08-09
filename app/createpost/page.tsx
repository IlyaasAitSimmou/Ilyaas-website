import React from 'react'
import NewPostForm from '../components/NewPostForm'
import { getSession } from '@/actions'

// Server component (no 'use client') fetches session then renders client form
const CreatePosts = async () => {
  const session = await getSession()
  return <NewPostForm session={session} />
}

export default CreatePosts