import React, { useState } from 'react'

const ContactForm = () => {
    const [name, setName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [errorContactMessage, setErrorContactMessage] = useState()
    const contactEmail = async () => {
        const res = await fetch('/api/contact_emails', {
            method: 'POST',
            body: JSON.stringify({
                name,
                phoneNumber,
                email,
                subject,
                message,
            }),
            })
            .then((res) => res.json())
            .then((resData) => {
            console.log(resData)
            if (resData.accepted) {
                setErrorContactMessage(resData.accepted)
            } else {
                setErrorContactMessage(resData.message)
            }
            })
    }
    return (
        <>
            <form onSubmit={contactEmail}>
                <input type="text" placeholder='Name' value={name} onChange={(e) => setName(e.target.value)}/>
                <input type="tel" placeholder='Phone Number' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}/>
                <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                <input type="text" placeholder='Subject' value={subject} onChange={(e) => setSubject(e.target.value)}/>
                <input type="text" placeholder='Message' value={message} onChange={(e) => setMessage(e.target.value)}/>
                <button type='submit'>Send Message</button>
            </form>
            <p>{errorContactMessage}</p>
        </>
    )
}

export default ContactForm