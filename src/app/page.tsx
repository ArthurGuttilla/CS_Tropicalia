import { redirect } from 'next/navigation'

// Force server-rendered so Vercel runs this as a function on every request,
// instead of pre-rendering a static redirect file that the edge may not serve.
export const dynamic = 'force-dynamic'

export default function Home() {
  redirect('/dashboard')
}
