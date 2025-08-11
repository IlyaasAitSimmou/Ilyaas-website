"use client"
import React from 'react'
import ContactForm from '../components/ContactForm'
import styles from './contact.module.css'

const Page = () => {
  return (
    <main className={styles.contactPage}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Let&apos;s Work Together</h1>
          <p className={styles.pageDescription}>
            I&apos;m always excited to collaborate on new projects and connect with fellow developers, 
            designers, and innovators. Whether you have a project in mind, want to discuss opportunities, 
            or just want to say hello, I&apos;d love to hear from you.
          </p>
        </div>
        
        <ContactForm />
        
        <div className={styles.socialSection}>
          <p className={styles.socialText}>You can also find me on:</p>
          <div className={styles.socialLinks}>
            <a href="https://www.linkedin.com/in/ilyaas-ait-simmou-3a4539291/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              LinkedIn
            </a>
            <a href="https://github.com/IlyaasAitSimmou" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              GitHub
            </a>
            <a href="mailto:yaseenaitsimmou@gmail.com" className={styles.socialLink}>
              Email
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Page
