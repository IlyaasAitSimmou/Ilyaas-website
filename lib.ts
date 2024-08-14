import { SessionOptions } from "iron-session"

export const envSite = process.env.SITE_URL
export interface SessionData {
    userId?:number,
    username?:string,
    email?: string
    logged_in?: boolean,
}

export const defaultSession:SessionData = {
    logged_in: false
}

export const sessionOptions: SessionOptions = {
    password: process.env.SECRET_KEY!,
    cookieName: "ilyaas-web-session",
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }
}