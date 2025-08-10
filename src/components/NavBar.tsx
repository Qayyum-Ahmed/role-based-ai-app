'use client'
import Link from 'next/link'
import { useSession, useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import './styles/navbar.css'

export default function NavBar() {
  const session = useSession()
  const user = useUser()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const signOut = async () => {
    setIsSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    setIsSigningOut(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'from-red-500 to-pink-500'
      case 'manager': return 'from-blue-500 to-indigo-500'
      case 'team': return 'from-green-500 to-emerald-500'
      case 'customer': return 'from-purple-500 to-violet-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const getRoleBadgeText = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin'
      case 'manager': return 'Manager'
      case 'team': return 'Team'
      case 'customer': return 'Customer'
      default: return 'User'
    }
  }

  return (
    <>
      <nav className="relative bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-100 px-6 py-4 z-50">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 opacity-50"></div>
        
        <div className="relative flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo Section */}
          <Link 
            href="/" 
            className="group flex items-center space-x-3 transform transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl 
                            flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl blur-lg opacity-0 
                            group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
            </div>
            <div>
              <h1 className="font-bold text-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 
                           bg-clip-text text-transparent">
                Support AI
              </h1>
              <p className="text-xs text-gray-500 font-medium">Powered by Intelligence</p>
            </div>
          </Link>

          {/* Navigation Links */}
          {session && user ? (
            <div className="flex items-center space-x-6">
              {/* Role Badge */}
              <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getRoleColor(user.user_metadata.role)} 
                            text-white text-sm font-bold shadow-lg transform hover:scale-105 transition-all duration-300`}>
                {getRoleBadgeText(user.user_metadata.role)}
              </div>

              {/* Navigation Links */}
              <div className="flex items-center space-x-4">
                <Link 
                  href={`/dashboard/${user.user_metadata.role}`}
                  className="relative group px-4 py-2 font-semibold text-gray-700 hover:text-purple-600 
                           transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative z-10">Dashboard</span>
                  <div className="absolute inset-0 bg-purple-100 rounded-lg opacity-0 group-hover:opacity-100 
                                transition-opacity duration-300 -z-0"></div>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full 
                                transition-all duration-300"></div>
                </Link>

                <Link 
                  href="/messages"
                  className="relative group px-4 py-2 font-semibold text-gray-700 hover:text-blue-600 
                           transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative z-10">Messages</span>
                  <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-0 group-hover:opacity-100 
                                transition-opacity duration-300 -z-0"></div>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full 
                                transition-all duration-300"></div>
                </Link>

                {/* Sign Out Button */}
                <button 
                  onClick={signOut}
                  disabled={isSigningOut}
                  className="relative group overflow-hidden px-6 py-2 rounded-full font-semibold 
                           bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg
                           transform hover:scale-105 hover:shadow-xl transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 
                                group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center space-x-2">
                    {isSigningOut ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing out...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="relative group px-6 py-2 font-semibold text-gray-700 hover:text-blue-600 
                         transition-all duration-300 transform hover:scale-105"
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 
                              transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full 
                              transition-all duration-300"></div>
              </Link>

              <Link 
                href="/signup"
                className="relative group overflow-hidden px-6 py-2 rounded-full font-semibold 
                         bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg
                         transform hover:scale-105 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 
                              group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile responsive overlay for smaller screens */}
      <div className="md:hidden">
        {session && user && (
          <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-2">
            <div className="flex justify-center space-x-4 text-sm">
              <span className="text-gray-600">Welcome back, {user.email?.split('@')[0]}!</span>
              <span className={`px-2 py-1 rounded-full bg-gradient-to-r ${getRoleColor(user.user_metadata.role)} 
                              text-white text-xs font-bold`}>
                {getRoleBadgeText(user.user_metadata.role)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}