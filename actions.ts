"use server"
import { getIronSession } from "iron-session"
import { SessionData, defaultSession, sessionOptions } from "./lib"
import { cookies } from "next/headers"
import { sql } from "@vercel/postgres"
import { redirect } from "next/navigation"

export const getSession = async () => {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions)


    if (!session.logged_in) {
        session.logged_in = defaultSession.logged_in;
    }
    return session;
}

export const login = async (prevState: { error: undefined | string }, formdata: FormData) => {
    const session = await getSession()
    
    const formUsernameOREmail = formdata.get("usernameOREmail") as string;
    const formPassword = formdata.get("password") as string
    const user = await sql`SELECT * FROM users WHERE (username = ${formUsernameOREmail} OR email = ${formUsernameOREmail}) AND password = ${formPassword} and verified = TRUE;`
    if (user.rows.length === 0) {
        return { error: 'Wrong credentials!' }
    } else {
        session.userId=user.rows[0].id
        session.username=user.rows[0].username
        session.email=user.rows[0].email
        session.logged_in=true
        await session.save()
        redirect('/')
    }

    
}

export const signUpAutoLogin = async (email: string, password: string) => {
    const session = await getSession()
    
    const FormEmail = email;
    const formPassword = password
    const user = await sql`SELECT * FROM users WHERE email = ${FormEmail} AND password = ${formPassword} and verified = TRUE;`
    if (user.rows.length === 0) {
        return {error: 'Wrong credentials!'}
    } else {
        session.userId=user.rows[0].id
        session.username=user.rows[0].username
        session.email=user.rows[0].email
        session.logged_in=true
        await session.save()
        redirect('/')
    }
}

export const logout = async () => {
    const session = await getSession();
    session.destroy()
    redirect('/')
}