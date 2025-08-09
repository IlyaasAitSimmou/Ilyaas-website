'use client'

import React from 'react'
import styles from './SkillsSection.module.css'

// Skills data with icons/logos
const skills = [
    {
        name: 'JavaScript',
        icon: '🟨',
        category: 'Language'
    },
    {
        name: 'TypeScript',
        icon: '🔵',
        category: 'Language'
    },
    {
        name: 'Python',
        icon: '🐍',
        category: 'Language'
    },
    {
        name: 'React',
        icon: '⚛️',
        category: 'Framework'
    },
    {
        name: 'Next.js',
        icon: '⚡',
        category: 'Framework'
    },
    {
        name: 'Three.js',
        icon: '🎨',
        category: 'Library'
    },
    {
        name: 'Node.js',
        icon: '🟢',
        category: 'Runtime'
    },
    {
        name: 'HTML5',
        icon: '🌐',
        category: 'Markup'
    },
    {
        name: 'CSS3',
        icon: '🎨',
        category: 'Styling'
    },
    {
        name: 'Git',
        icon: '📝',
        category: 'Version Control'
    },
    {
        name: 'Unity',
        icon: '🎮',
        category: 'Game Engine'
    },
    {
        name: 'Arduino',
        icon: '🔌',
        category: 'Hardware'
    }
]

const SkillsSection = () => {
    const categories = [...new Set(skills.map(skill => skill.category))]

    return (
        <div className={styles.skillsSection}>
            <div className={styles.skillsContainer}>
                <h2 className={styles.skillsTitle}>My Skills & Technologies</h2>
                <p className={styles.skillsSubtitle}>
                    Here are the technologies and tools I work with
                </p>
                
                <div className={styles.categoriesContainer}>
                    {categories.map((category) => (
                        <div key={category} className={styles.categorySection}>
                            <h3 className={styles.categoryTitle}>{category}</h3>
                            <div className={styles.skillsGrid}>
                                {skills
                                    .filter(skill => skill.category === category)
                                    .map((skill) => (
                                        <div key={skill.name} className={styles.skillItem}>
                                            <div className={styles.skillIcon}>
                                                <span className={styles.iconText}>{skill.icon}</span>
                                            </div>
                                            <span className={styles.skillName}>{skill.name}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SkillsSection 