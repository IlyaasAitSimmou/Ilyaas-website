import { useState } from 'react'
import DrawingCanvas from './Canvas'

const NewPostForm = () => {
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [errorContactMessage, setErrorContactMessage] = useState()
    return (
        <form action="">
            <DrawingCanvas/>
        </form>
    )
}

export default NewPostForm