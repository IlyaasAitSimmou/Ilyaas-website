import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
// export async function POST(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const email = searchParams.get('email');
//   const username = searchParams.get('username');
//   const password = searchParams.get('password');
//   const confirmation = searchParams.get('confirmation');
//   const description = searchParams.get('about');
//   console.log(email, username, password, confirmation, description, request.url)
 
//   try {
//     if (!email || !username || !password) throw new Error('Missing fields');
//     if (password !== confirmation) throw new Error('Passwords do not match!');
//     await sql`INSERT INTO users (email, username, description, password) VALUES (${email}, ${username}, ${description}, ${password});`;
//   } catch (error) {
//     console.log(error)
//     return NextResponse.json({ error }, { status: 500 });
//   }
 
//   const users = await sql`SELECT * FROM users;`;
//   return NextResponse.json({ users }, { status: 200 });
// }
export async function POST(request: Request) {
  let reqJson = await request.json();
  console.log(reqJson)
  const email = reqJson.email;
  const username = reqJson.username;
  const password = reqJson.password;
  const confirmation = reqJson.confirmation;
  const description = reqJson.about;
  console.log(email, username, password, confirmation, description, request.url)
 
  try {
    if (!email || !username || !password) throw new Error('Missing fields');
    if (password !== confirmation) throw new Error('Passwords do not match!');
    if (password.length < 8) throw new Error('Password is too short')
    await sql`INSERT INTO users (email, username, description, password) VALUES (${email}, ${username}, ${description}, ${password});`;
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error }, { status: 500 });
  }
 
  const users = await sql`SELECT * FROM users;`;
  return NextResponse.json({ username }, { status: 200 });
}