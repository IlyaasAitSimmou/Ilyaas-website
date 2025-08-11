import { sendEmail } from "@/utils/mail.utils";

export async function POST(request: Request) {
    let reqJson = await request.json();
    console.log(reqJson)
    const user = reqJson.name
    const phoneNumber = reqJson.phoneNumber
    const email = reqJson.email
    const subject = reqJson.subject
    const message = reqJson.message

    const sender = {
        name: user,
        address: email
    }
    const recipients = [{
        name: 'Ilyaas Ait Simmou',
        address: 'yaseenaitsimmou@gmail.com'
    }]
    try {
        const result = await sendEmail({
            sender,
            recipients,
            subject: subject,
            message: `Ilyaas. You have recieved a new message from ${user} whose email is ${email} and has phone number ${phoneNumber}: ${message}`
        })

        return Response.json({
            accepted: result.accepted,
        })
    } catch (error) {
        console.log(error)
        return Response.json({message: 'Failed to send email. Please try again'}, {status: 500})
    }
}