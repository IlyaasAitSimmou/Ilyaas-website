import { redirect } from 'next/navigation'
import { envSite } from '@/lib'

export async function GET(request: Request, { params }: { params: { token: string } }) {
    const token = params.token
    console.log('token: ', token)
    await fetch(`${envSite}api/verify`, {
      method: 'POST',
      body: JSON.stringify({
          token
      }),
    })
    .then((res) => res.json())
    .then((resData) => {
    console.log(resData)
    if (resData.message) {
      redirect('/profile')
    }
  })
}
