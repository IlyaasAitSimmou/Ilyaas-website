import React, { useState } from 'react'

const ContactForm = () => {
    const [name, setName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const contactEmail = () => {
        
    }
    return (
        <form onSubmit={contactEmail}>
            <input type="text" placeholder='Name' value={name} onChange={(e) => setName(e.target.value)}/>
            <input type="tel" placeholder='Phone Number' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}/>
            <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}/>
            <input type="text" placeholder='Subject' value={subject} onChange={(e) => setSubject(e.target.value)}/>
            <input type="text" placeholder='Message' value={message} onChange={(e) => setMessage(e.target.value)}/>
            <button type='submit'>Send Message</button>
        </form>
    )
}

export default ContactForm