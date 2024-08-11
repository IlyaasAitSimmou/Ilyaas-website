import React from 'react'
import "./about.css";

const about_me: string  = ('I am, Ilyaas Ait Simmou, an exceptional high school student in the International Baccalaureate program aspiring to pursue' +
'a field in engineering or computer science. My main interests are aviation, cars, programming, and astronomy. My favourite hobbies are' + 
'building model rockets, stargazing, creating robots, and of course, programming.')

const page = () => {
  return (
    <div>
        <h1> About Me</h1>
        <p>{about_me}</p>
    </div>
  )
}

export default page
