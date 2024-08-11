import Image, { StaticImageData } from 'next/image'
import React from 'react'
import Link from 'next/link'
import './projectcard.css'


const ProjectCard = (props: {title: string, image?: StaticImageData, description: string, styles?: {}}) => {
  return (
    <Link href={props.title}>
        <div className='card'>
            {props.image ? 
            <><Image src={props.image} alt='' width={100} height={100} className='image'/><h1 className='title'>{props.title}</h1></>
            : 
            <div>{props.title}</div>
            }
            <p className='description'>{props.description}</p>
        </div>
    </Link>
  )
}




export default ProjectCard