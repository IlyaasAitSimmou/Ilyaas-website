import { redirect } from 'next/navigation'

export async function GET(request: Request, { params }: { params: { token: string } }) {
    const token = params.token
    console.log('token: ', token)
    await fetch(`http://ilyaas-website.vercel.app/api/verify`, {
      method: 'POST',
      body: JSON.stringify({
          token
      }),
    })
    .then((res) => res.json())
    .then((resData) => {
    console.log(resData)
    if (resData.message) {
      redirect('/contact')
    }
  })
}
