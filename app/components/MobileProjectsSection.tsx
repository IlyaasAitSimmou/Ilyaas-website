'use client'

import React from 'react'
import styles from './MobileProjectsSection.module.css'

interface Project {
    id: string;
    title: string;
    desc: string;
    color?: string;
    link?: string;
    github?: string;
    devpost?: string;
    demo?: string;
    image?: string;
    gradient?: string;
    imageSize?: 'contain' | 'cover' | 'fill';
}

const projects: Project[] = [
    { id: 'c1', title: 'Portfolio Website', desc: 'The project you are looking at right now!', color: '#4fc3f7', link: '/projects', github: 'https://github.com/IlyaasAitSimmou/Ilyaas-website', gradient: 'linear-gradient(135deg, #ffd43b, #f39c12)' },
    { id: 'c2', title: 'Rocket Simulation', desc: '3D simulator to replay model rocket flights based on sensor data.', color: '#ff6b6b', link: '/projects', image: '/logos/rocketsim2.png', github: 'https://github.com/IlyaasAitSimmou/rocket_flight_sim' },
    { id: 'c3', title: 'SpendWise', desc: 'A web application that tracks and evaluating user spending habits by scanning receipts and provides alternatives based on location.', link: '/projects', image: '/logos/spendwise.png', github: 'https://github.com/aarnavshah12/SpendWise', devpost: 'https://devpost.com/software/spendwise-4hqxyk', demo: 'https://spend-wise-liart.vercel.app/', imageSize: 'contain', color: 'white' },
    { id: 'c4', title: 'SIMAD Foundation', desc: 'The official website of SIMAD, an organization focused on providing students with competition-based learning experiences.', color: '#ffd43b', link: '/projects', github: 'https://github.com/IlyaasAitSimmou/simad_website', demo: 'https://simadfoundation.com/', image: '/logos/simad.png' },
    { id: 'c5', title: 'Flappy Fitness', desc: 'An exercise-controlled variant of Flappy Bird built with Pygame and OpenCV', color: '#ff9f43', link: '/projects', image: '/logos/flappyfitness.png', github: 'https://github.com/aarnavshah12/Flappy-Fitness', devpost: 'https://devpost.com/software/flappy-fitness-jzghs7'},
    { id: 'c6', title: 'Numina', desc: 'A web application that instantly turns any topic into a narrated math animation with a live AI agent for personalized tutoring.', color: '#06101e', link: '/projects', image: '/logos/numina.png', github: 'https://github.com/NimayDesai/Numina', devpost: 'https://devpost.com/software/numina-a9vyu4', imageSize: 'contain' },
    { id: 'c7', title: 'Classcade', desc: 'A Google Classroom like platform where learning is gamified and player stats improve with student diligence.', color: '#ff6f61', link: '/projects', gradient: 'linear-gradient(135deg, #ff9f43, #ff7675)', devpost: 'https://devpost.com/software/classcade', github: 'https://github.com/IlyaasAitSimmou/ClassCade' },
    { id: 'c8', title: 'upNotes.ai', desc: 'A full-stack LLM based application that helps students take better notes, practice concepts, and improve their grades', color: 'black', gradient: 'linear-gradient(55deg,rgba(0, 0, 0, 1) 0%, rgba(61, 61, 61, 1) 100%)', link: '/projects', image: '/logos/upnotesai.png', github: 'https://github.com/JinayD1/upNotes.ai', devpost: 'https://devpost.com/software/placeholder-u0mvno', imageSize: 'contain'},
    { id: 'c9', title: 'TeenToolkit', desc: 'An AI-powered web application containing various tools to assist teenagers in financial, education, and social aspects of their daily lives.', color: '#1e90ff', link: '/projects', github: 'https://github.com/IlyaasAitSimmou/recess_hacks_project', devpost: 'https://devpost.com/software/teentoolkit?ref_content=user-portfolio&ref_feature=in_progress', image: '/logos/teentoolkit.webp' },
    { id: 'c10', title: 'SpeechDoc', desc: 'A basic machine learning project including a streamlit app where two models are used to predict the gender of a speaker featured in an audio and whether or not their voice is impaired.', color: '#abcdef', link: '/projects', github: 'https://github.com/IlyaasAitSimmou/SpeechDoc', demo: 'https://speechdoc.streamlit.app/', imageSize: 'contain' }
]

const MobileProjectsSection = () => {
    const handleLinkClick = (url: string) => {
        window.open(url, '_blank')
    }

    return (
        <div className={styles.mobileProjectsSection}>
            
            <div className={styles.projectsGrid}>
                {projects.map((project) => (
                    <div 
                        key={project.id} 
                        className={styles.projectCard}
                        style={{
                            background: project.gradient || project.color || '#333',
                            color: project.color === 'white' || project.color === '#ffd43b' ? '#000' : '#fff'
                        }}
                    >
                        {project.image && (
                            <div className={styles.projectImage}>
                                <img 
                                    src={project.image} 
                                    alt={project.title}
                                    style={{
                                        objectFit: project.imageSize || 'cover'
                                    }}
                                />
                            </div>
                        )}
                        
                        <div className={styles.projectContent}>
                            <h3 className={styles.projectTitle}>{project.title}</h3>
                            <p className={styles.projectDesc}>{project.desc}</p>
                            
                            <div className={styles.projectLinks}>
                                {project.github && (
                                    <button 
                                        className={styles.linkButton}
                                        onClick={() => handleLinkClick(project.github!)}
                                        aria-label={`View ${project.title} on GitHub`}
                                    >
                                        GitHub
                                    </button>
                                )}
                                {project.demo && (
                                    <button 
                                        className={styles.linkButton}
                                        onClick={() => handleLinkClick(project.demo!)}
                                        aria-label={`View ${project.title} demo`}
                                    >
                                        Demo
                                    </button>
                                )}
                                {project.devpost && (
                                    <button 
                                        className={styles.linkButton}
                                        onClick={() => handleLinkClick(project.devpost!)}
                                        aria-label={`View ${project.title} on DevPost`}
                                    >
                                        DevPost
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MobileProjectsSection
