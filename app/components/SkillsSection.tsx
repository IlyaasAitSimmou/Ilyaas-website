'use client'

import React from 'react'
import styles from './SkillsSection.module.css'
import Image from 'next/image'

// Skills data with icons/logos
const skills = [
    {
        name: 'JavaScript',
        image: '/logos/JavaScript.png',
        // category: 'Languages'
    },
    {
        name: 'TypeScript',
        image: '/logos/Typescript.png',
        // category: 'Languages'
    },
    {
        name: 'Python',
        image: '/logos/Python.png',
        // category: 'Languages'
    },
    {
        name: 'C++',
        image: '/logos/C++.png',
        // category: 'Languages'
    },
    {
        name: 'HTML5',
        image: '/logos/HTML5.png',
        // category: 'Languages'
        dimensions: { width: 90 }
    },
    {
        name: 'CSS3',
        image: '/logos/CSS3.png',
        // category: 'Languages'
        dimensions: { width: 65 }
    },
    {
        name: 'React Native',
        image: '/logos/reactnative.png',
        // category: 'Framework'
    },
    {
        name: 'Next.js',
        image: '/logos/nextjs.png',
        // category: 'Framework',
        background: 'white'
    },
    {
        name: 'Django',
        image: '/logos/django.png',
        // category: 'Framework'
    },
    {
        name: 'Flask',
        image: '/logos/flask.png',
        // category: 'Framework'
        dimensions: { width: 70 },
        background: 'white'
    },
    {
        name: 'Three.js',
        image: '/logos/threejs.png',
        // category: 'Library'
        dimensions: { width: 80 }
    },
    {
        name: 'React.js',
        image: '/logos/reactjs.png',
        // category: 'Library'
    },
    {
        name: 'OpenGL',
        image: '/logos/opengl.png',
        // category: 'Library'
        dimensions: { width: 100 },
        background: 'white'
    },
    {
        name: 'MatPlotlib',
        image: '/logos/matplotlib.png',
        // category: 'Library'
    },
    // {
    //     name: 'Pygame',
    //     image: '/logos/nodejs.png',
    //     // category: 'Library'
    // },
    {
        name: 'Git',
        image: '/logos/git.png',
        // category: 'Version Control'
        background: 'black'
    },
    {
        name: 'Arduino',
        image: '/logos/arduino.png',
        // category: 'Hardware'
    },
    {
        name: 'PostgreSQL',
        image: '/logos/postgresql.png',
        // category: 'Database'
        dimensions: { width: 80 },
        background: 'white'
    },
    {
        name: 'MySQL',
        image: '/logos/mysql.png',
        // category: 'Database'
        dimensions: { width: 80 },
        background: 'white'
    }
]

const SkillsSection = () => {
    // const categories = Array.from(new Set(skills.map(s => s.category)))

    return (
        <div className={styles.skillsSection}>
            <div className={styles.skillsContainer}>
                <h2 className={styles.skillsTitle}>My Skills & Technologies</h2>
                <p className={styles.skillsSubtitle}>
                    Here some of the technologies and tools I work with
                </p>
                
                <div className={styles.categoriesContainer}>
                   
                         <div className={styles.categorySection}>
                             {/* <h3 className={styles.categoryTitle}>{category}</h3> */}
                            <div className={styles.skillsGrid}>
                                {skills
                                    .map((skill) => (
                                        <div key={skill.name} className={styles.skillItem}>
                                            <div className={styles.logoWrapper} data-skill={skill.name} style={skill.background ? { backgroundColor: skill.background } : {}}>
                                                <Image src={skill.image} alt={skill.name} width={56} height={56} style={skill.dimensions? {width: `${skill.dimensions.width}%`, height: 'auto', } : {height:'100%', width:'auto'}} />
                                            </div>
                                            <span className={styles.skillName}>{skill.name}</span>
                                        </div>
                                    ))}
                            </div>
                         </div>
                </div>
            </div>
        </div>
    )
}

export default SkillsSection 



//  {categories.map((category) => ( ))}