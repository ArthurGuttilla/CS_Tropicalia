import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">CS Tropicalia</h1>
          <p className="text-sm text-slate-500 mt-1">Customer Success AI Platform</p>
        </div>
        <SignUp />
      </div>
    </div>
  )
}
