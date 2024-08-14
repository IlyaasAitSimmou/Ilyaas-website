"use client"

import { login } from "@/actions"
import { useFormState } from "react-dom"

const LoginForm = () => {
    const [state, formAction] = useFormState<any, FormData>(login, undefined)

    return (
        <>
            <form action={formAction}>
                <input type="text" name="usernameOREmail" placeholder='Email or Username'/>
                <input type="password" name="password" placeholder='Password'/>
                <button type='submit'>Login</button>
            </form>
            <p>{state?.error && state.error}</p>
        </>
    )
}

export default LoginForm