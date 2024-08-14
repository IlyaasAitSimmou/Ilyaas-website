import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';


export async function POST(request: Request) {
    let reqJson = await request.json();
    console.log(reqJson)
    const token = reqJson.token;

    try {
      const user = await sql`UPDATE users SET verified = TRUE, logged_in = TRUE WHERE verification_token = ${token} RETURNING *;`;
      console.log(user)
    } catch (error) {
      console.log(error)
      return NextResponse.json({ error }, { status: 500 });
    }
   
    const users = await sql`SELECT * FROM users;`;
    return NextResponse.json({ message: 'your account is verified' }, { status: 200 });
  }