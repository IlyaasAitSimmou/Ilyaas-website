import React from 'react'
import ProjectCard from '../components/ProjectCard'
import testImage from '../../public/test.jpg'
const page = () => {
  return (
    <div>
        <h1> My projects</h1>
        <p> I&apos;ve created many projects in the past:</p>
        <div className='projects_container'>
          <ProjectCard title='Test' image={testImage} description='Lorem Ipsum Lorem ipsum'/>
        </div>
    </div>
  )
}

export default page