"use client"
import React from 'react'
import NewPostForm from '../components/NewPostForm'
import { getSession } from '@/actions'

const CreatePosts = async () => {
  const session = await getSession()
  return (
    <NewPostForm session={session}/>
  )
}

export default CreatePosts