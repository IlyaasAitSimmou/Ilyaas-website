import { sendEmail } from "@/utils/mail.utils";

export async function POST(request: Request) {
    let reqJson = await request.json();
    console.log(reqJson)
    const user = reqJson.username
    const email = reqJson.email;
    const verificationLink = reqJson.link
    const sender = {
        name: 'myapp',
        address: 'no-reply@ilyaasweb.com'
    }
    const recipients = [{
        name: user,
        address: email
    }]
    try {
        const result = await sendEmail({
            sender,
            recipients,
            subject: 'Verify your account',
            message: `Welcome to Ilyaas' website. Verify your account with this link: ${verificationLink}`
        })

        return Response.json({
            accepted: result.accepted,
        })
    } catch (error) {
        console.log(error)
        return Response.json({message: 'Failed to send verification email. Please try again'}, {status: 500})
    }
}