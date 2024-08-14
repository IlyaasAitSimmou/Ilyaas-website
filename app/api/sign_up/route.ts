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
  let token: any = ''
  // console.log(email, username, password, confirmation, description, request.url)
 
  try {
    if (!email || !username || !password) throw new Error('Missing fields');
    if (password !== confirmation) throw new Error('Passwords do not match!');
    if (password.length < 8) throw new Error('Password is too short')
    token = await sql`INSERT INTO users (email, username, description, password, verification_token) VALUES (${email}, ${username}, ${description}, ${password}, gen_random_uuid()) RETURNING verification_token;`;
    token = token.rows[0].verification_token
    console.log('verification_token: ', token)
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error }, { status: 500 });
  }
 
  const users = await sql`SELECT * FROM users ;`;
  // console.log(users)
  setTimeout(() => deleteAccount(email, username), 300000)
  return NextResponse.json({ username, email, token }, { status: 200 });
}

async function deleteAccount(email: string, username: string) {
  await sql`DELETE FROM users WHERE email = ${email} AND verified = FALSE AND logged_in = FALSE;`;
  console.log('account deleted')
}