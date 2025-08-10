'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import './style.css'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type Inputs = z.infer<typeof schema>

export default function SignupPage() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [err, setErr] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({ 
    resolver: zodResolver(schema) 
  })

  const onSubmit = async (data: Inputs) => {
    setIsLoading(true)
    setErr('')
    setSuccess(false)

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { role: 'customer' } },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!signUpData.user) {
        throw new Error('Signup failed - no user returned')
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: signUpData.user.id,
        name: data.name,
        email: data.email,
        role: 'customer',
      })

      if (profileError) {
        // Attempt rollback if possible
        await supabase.auth.admin.deleteUser(signUpData.user.id).catch(() => {})
        throw new Error('Failed to complete signup. Please try again.')
      }

      setSuccess(true)
      setTimeout(() => {
        router.replace('/login')
      }, 2000)

    } catch (error: any) {
      console.error('Signup error:', error)
      setErr(error.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-blue-900"></div>
      <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M0 0h80v80H0V0zm20 20v40h40V20H20zm20 35a15 15 0 110-30 15 15 0 010 30z" fill-rule="nonzero"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-float`}></div>      
      {/* Floating orbs */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-1/2 right-1/2 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 p-10 rounded-3xl shadow-2xl border border-white/20 
                      transform transition-all duration-700 hover:scale-[1.02] hover:shadow-3xl animate-slideInUp">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 
                          rounded-3xl mb-6 shadow-2xl transform hover:rotate-12 transition-all duration-500">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Join Us Today</h1>
            <p className="text-white/70 text-lg">Create your account and get started</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl backdrop-blur-sm animate-fadeInScale">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-emerald-100 font-semibold">Account Created!</h3>
                  <p className="text-emerald-200 text-sm">Redirecting to login...</p>
                </div>
              </div>
            </div>
          )}

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
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white/90">Full Name</label>
              <div className="relative group">
                <input 
                  {...register('name')} 
                  placeholder="Enter your full name"
                  className="w-full border-2 border-white/20 px-4 py-4 rounded-2xl text-lg font-medium 
                           bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50
                           focus:border-emerald-400 focus:bg-white/20 focus:shadow-lg focus:shadow-emerald-500/30 
                           transition-all duration-300 outline-none group-hover:border-white/30"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              {errors.name && (
                <p className="text-red-300 text-sm flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.name.message}</span>
                </p>
              )}
            </div>

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
                           focus:border-emerald-400 focus:bg-white/20 focus:shadow-lg focus:shadow-emerald-500/30 
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
                  placeholder="Create a secure password"
                  className="w-full border-2 border-white/20 px-4 py-4 rounded-2xl text-lg font-medium 
                           bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50
                           focus:border-emerald-400 focus:bg-white/20 focus:shadow-lg focus:shadow-emerald-500/30 
                           transition-all duration-300 outline-none group-hover:border-white/30"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
              disabled={isLoading || success}
              className="relative w-full group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-2xl 
                            transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-emerald-500/50
                            group-disabled:from-gray-500 group-disabled:to-gray-600"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-2xl 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            group-disabled:opacity-0"></div>
              <div className="relative px-8 py-4 text-white font-bold text-xl rounded-2xl flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>Creating Account...</span>
                  </>
                ) : success ? (
                  <>
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Account Created!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Create Account</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/70 mb-4">Already have an account?</p>
            <a 
              href="/login" 
              className="inline-flex items-center space-x-2 text-emerald-300 hover:text-emerald-100 
                       font-semibold transition-all duration-300 transform hover:scale-105 
                       hover:shadow-lg hover:shadow-emerald-500/30 px-4 py-2 rounded-xl 
                       bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span>Sign In Instead</span>
            </a>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-white/50 text-xs">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}