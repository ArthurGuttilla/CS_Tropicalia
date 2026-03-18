import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CS Tropicalia — Customer Success AI',
  description: 'Memória semântica para cada cliente. Briefings automáticos, health scores e alertas proativos.',
}

const clerkEnabled =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY

async function Providers({ children }: { children: React.ReactNode }) {
  if (clerkEnabled) {
    const { ClerkProvider } = await import('@clerk/nextjs')
    return <ClerkProvider>{children}</ClerkProvider>
  }
  return <>{children}</>
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <html lang="pt-BR">
        <body className={inter.className}>{children}</body>
      </html>
    </Providers>
  )
}
