'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSupabaseClient, useSession, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import './style.css'

const schema = z.object({ 
  email: z.string().email('Please enter a valid email address'), 
  password: z.string().min(6, 'Password must be at least 6 characters') 
})
type Inputs = z.infer<typeof schema>

export default function LoginPage() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const user = useUser()
  const router = useRouter()
  const [err, setErr] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({ 
    resolver: zodResolver(schema) 
  })

  useEffect(() => {
    if (user) {
      router.replace(`/dashboard/${user.user_metadata.role}`)
    }
  }, [user, router])

  const onSubmit = async (data: Inputs) => {
    setIsLoading(true)
    setErr('')
    
    try {
      const { error } = await supabase.auth.signInWithPassword(data)
      if (error) {
        throw new Error(error.message)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setErr(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="100" height="100" ...')] animate-float`}></div>
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 p-10 rounded-3xl shadow-2xl border border-white/20 
                      transform transition-all duration-700 hover:scale-[1.02] hover:shadow-3xl animate-slideInUp">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 
                          rounded-3xl mb-6 shadow-2xl transform hover:rotate-12 transition-all duration-500">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/70 text-lg">Sign in to continue your journey</p>
          </div>

          {/* Error Message */}
          {err && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-2xl backdrop-blur-sm animate-shake">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-100 font-medium">{err}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white/90">Email Address</label>
              <div className="relative group">
                <input 
                  {...register('email')} 
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border-2 border-white/20 px-4 py-4 rounded-2xl text-lg font-medium 
                           bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50
                           focus:border-purple-400 focus:bg-white/20 focus:shadow-lg focus:shadow-purple-500/30 
                           transition-all duration-300 outline-none group-hover:border-white/30"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              {errors.email && (
                <p className="text-red-300 text-sm flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white/90">Password</label>
              <div className="relative group">
                <input 
                  {...register('password')} 
                  type="password" 
                  placeholder="Enter your password"
                  className="w-full border-2 border-white/20 px-4 py-4 rounded-2xl text-lg font-medium 
                           bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50
                           focus:border-purple-400 focus:bg-white/20 focus:shadow-lg focus:shadow-purple-500/30 
                           transition-all duration-300 outline-none group-hover:border-white/30"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
                  </svg>
                </div>
              </div>
              {errors.password && (
                <p className="text-red-300 text-sm flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="relative w-full group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl 
                            transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/50
                            group-disabled:from-gray-500 group-disabled:to-gray-600"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-2xl 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            group-disabled:opacity-0"></div>
              <div className="relative px-8 py-4 text-white font-bold text-xl rounded-2xl flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign In</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/70 mb-4">Don't have an account?</p>
            <a 
              href="/signup" 
              className="inline-flex items-center space-x-2 text-purple-300 hover:text-purple-100 
                       font-semibold transition-all duration-300 transform hover:scale-105 
                       hover:shadow-lg hover:shadow-purple-500/30 px-4 py-2 rounded-xl 
                       bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-sm"
            >
              <span>Create Account</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}