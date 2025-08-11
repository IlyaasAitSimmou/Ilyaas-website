import React, { useState } from 'react'
import styles from './ContactForm.module.css'

const ContactForm = () => {
    const [name, setName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [errorContactMessage, setErrorContactMessage] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const contactEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrorContactMessage('')
        
        try {
            const res = await fetch('/api/contact_emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    phoneNumber,
                    email,
                    subject,
                    message,
                }),
            })
            
            const resData = await res.json()
            
            if (resData.accepted) {
                setIsSuccess(true)
                setErrorContactMessage('Message sent successfully! I\'ll get back to you soon.')
                // Clear form
                setName('')
                setPhoneNumber('')
                setEmail('')
                setSubject('')
                setMessage('')
            } else {
                setErrorContactMessage(resData.message || 'Failed to send message. Please try again.')
            }
        } catch (error) {
            setErrorContactMessage('Network error. Please check your connection and try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={styles.contactContainer}>
            <div className={styles.formWrapper}>
                <h2 className={styles.formTitle}>Get In Touch</h2>
                <p className={styles.formSubtitle}>
                    Have a project in mind? Let&apos;s discuss how we can bring your ideas to life.
                </p>
                
                <form onSubmit={contactEmail} className={styles.contactForm}>
                    <div className={styles.inputGroup}>
                        <input 
                            type="text" 
                            placeholder='Your Name' 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <input 
                            type="email" 
                            placeholder='Your Email' 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <input 
                            type="tel" 
                            placeholder='Phone Number (Optional)' 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={styles.inputField}
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <input 
                            type="text" 
                            placeholder='Subject' 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <textarea 
                            placeholder='Your Message' 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)}
                            className={`${styles.inputField} ${styles.textareaField}`}
                            rows={5}
                            required
                        />
                    </div>
                    
                    <button 
                        type='submit' 
                        className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className={styles.spinner}></span>
                                Sending...
                            </>
                        ) : (
                            'Send Message'
                        )}
                    </button>
                </form>
                
                {errorContactMessage && (
                    <div className={`${styles.message} ${isSuccess ? styles.successMessage : styles.errorMessage}`}>
                        {errorContactMessage}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ContactForm