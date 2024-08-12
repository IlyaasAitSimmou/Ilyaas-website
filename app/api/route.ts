"use server"
import { postgresConnectionString, sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';


export default async function signUp(email:string, username:string, password:string, confirmation:string, about:string) {
    if (email && username && password && confirmation) {
      console.log('POSTGRES_URL:', process.env.POSTGRES_URL);
      console.log('pass1')
      if (password !== confirmation) {
        return '';
      } else {
        try {
          await sql`INSERT INTO users (email, username, description, password) VALUES (${email}, ${username}, ${about}, ${password});`;
        } catch (error) {
          console.log(error)
          return NextResponse.json({ error }, { status: 500 });
        }
      
        const users = await sql`SELECT * FROM users;`;
        console.log(`here is ${users}`)
        return NextResponse.json({ users }, { status: 200 });
        }
      } else {
        console.log('error1')
      return ''
    }
}