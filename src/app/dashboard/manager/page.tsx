'use client'

import ProtectedRoute from '../../../components/ProtectedRoute'
import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import MessageList from '../../../components/MessageList'
import MessageForm from '../../../components/MessageForm'
import './style.css'

export default function ManagerPage() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [member, setMember] = useState({ name: '', email: '', password: '' })
  const [team, setTeam] = useState<{ id: string; name: string; email: string; created_by: string }[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState({
    team: true,
    createMember: false,
  })
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<boolean>(false)

  useEffect(() => {
    if (!user?.id) return

    const fetchTeam = async () => {
      try {
        setLoading(prev => ({ ...prev, team: true }))
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, created_by')
          .eq('manager_id', user.id)
          .eq('role', 'team')

        if (error) throw error
        if (data) setTeam(data)
      } catch (error: any) {
        console.error('Error fetching team:', error)
        setError('Failed to load team members')
      } finally {
        setLoading(prev => ({ ...prev, team: false }))
      }
    }

    fetchTeam()
  }, [user?.id, supabase])

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(prev => ({ ...prev, createMember: true }))
    setError('')
    setSuccess(false)

    try {
      if (!member.name || !member.email || !member.password) {
        throw new Error('All fields are required')
      }

      const res = await fetch('/api/create-team-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      })

      const result = await res.json()
      
      if (!res.ok) {
        throw new Error(result.error || 'Failed to create team member')
      }

      setMember({ name: '', email: '', password: '' })
      setSuccess(true)
      
      // Refresh team list
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email, created_by')
        .eq('manager_id', user?.id)
        .eq('role', 'team')
      
      if (data) setTeam(data)

      setTimeout(() => setSuccess(false), 3000)

    } catch (error: any) {
      setError(error.message || 'Failed to create team member')
    } finally {
      setLoading(prev => ({ ...prev, createMember: false }))
    }
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xl font-semibold text-gray-700">Loading manager dashboard...</span>
      </div>
    </div>
  )

  return (
    <ProtectedRoute role="manager">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
        {/* Background Decorations */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2280%22 height=%2280%22 viewBox=%220%200%2080%2080%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill-rule=%22evenodd%22%3E%3Cg fill=%22%233b82f6%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M0%200h80v80H0V0zm20%2020v40h40V20H20zm20%2035a15%2015%200%20110-30%2015%2015%200%20010%2030z%22 fill-rule=%22nonzero%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>

        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slideInDown">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 
                          rounded-3xl mb-6 shadow-2xl transform hover:rotate-12 transition-all duration-500">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v10M9 7h1m-1 4h1m4-4h1m-1 4h1" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Manager Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Lead your team, manage communications, and drive success
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Team Management */}
            <div className="space-y-8">
              {/* Team Overview */}
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50 
                            transform transition-all duration-500 hover:shadow-3xl animate-slideInLeft">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl 
                                flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Your Team</h2>
                  <div className="ml-auto px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                    {team.length} members
                  </div>
                </div>

                {loading.team ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : team.length > 0 ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                    {team.map((member, index) => (
                      <div
                        key={member.id}
                        className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 
                                 transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-slideInUp"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl 
                                          flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-lg">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{member.name}</p>
                              <p className="text-gray-600 text-sm">{member.email}</p>
                              <p className="text-xs text-gray-500">
                                {member.created_by === user.id ? 'Created by you' : 'Created by admin'}
                              </p>
                            </div>
                          </div>
                          <button
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white 
                                     rounded-xl font-semibold text-sm shadow-lg transform transition-all duration-300 
                                     hover:scale-105 hover:shadow-xl"
                            onClick={() => {
                              setSelectedUserId(null)
                              setTimeout(() => setSelectedUserId(member.id), 0)
                            }}
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No team members assigned yet</p>
                  </div>
                )}
              </div>

              {/* Add Team Member Form */}
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50 
                            transform transition-all duration-500 hover:shadow-3xl animate-slideInLeft"
                   style={{ animationDelay: '200ms' }}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl 
                                flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Add Team Member</h2>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl animate-shake">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-red-600 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl animate-fadeInScale">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-600 font-medium">Team member created successfully!</p>
                    </div>
                  </div>
                )}

                <form onSubmit={createTeam} className="space-y-4">
                  <input 
                    value={member.name} 
                    onChange={e => setMember({ ...member, name: e.target.value })} 
                    placeholder="Team Member Name" 
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg font-medium bg-white/70 
                             focus:border-purple-500 focus:bg-white focus:shadow-lg transition-all duration-300 outline-none"
                    disabled={loading.createMember}
                  />
                  <input 
                    value={member.email} 
                    onChange={e => setMember({ ...member, email: e.target.value })} 
                    placeholder="Team Member Email" 
                    type="email"
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg font-medium bg-white/70 
                             focus:border-purple-500 focus:bg-white focus:shadow-lg transition-all duration-300 outline-none"
                    disabled={loading.createMember}
                  />
                  <input 
                    type="password" 
                    value={member.password} 
                    onChange={e => setMember({ ...member, password: e.target.value })} 
                    placeholder="Team Member Password" 
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg font-medium bg-white/70 
                             focus:border-purple-500 focus:bg-white focus:shadow-lg transition-all duration-300 outline-none"
                    disabled={loading.createMember}
                  />
                  <button 
                    type="submit"
                    disabled={loading.createMember}
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-xl 
                             font-bold text-lg shadow-lg transform transition-all duration-300 hover:scale-[1.02] 
                             hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.createMember ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Team Member'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column - Messaging */}
            <div className="space-y-8">
              {/* Messaging Section */}
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50 
                            transform transition-all duration-500 hover:shadow-3xl animate-slideInRight">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl 
                                flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Team Communication</h2>
                </div>

                <MessageForm
                  key={selectedUserId ?? 'default'}
                  toOptions={team.map(t => ({ id: t.id, name: t.name }))}
                  role="manager"
                  toUserId={selectedUserId ?? undefined}
                />
              </div>

              {/* Message History */}
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50 
                            transform transition-all duration-500 hover:shadow-3xl animate-slideInRight"
                   style={{ animationDelay: '200ms' }}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl 
                                flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Your Messages</h2>
                </div>
                
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  <MessageList withUser={user.id} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 animate-slideInUp">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 
                          transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl 
                              flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Team Size</h3>
                  <p className="text-2xl font-bold text-blue-600">{team.length}</p>
                  <p className="text-gray-600 text-sm">Active members</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 
                          transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl 
                              flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Management</h3>
                  <p className="text-2xl font-bold text-emerald-600">Active</p>
                  <p className="text-gray-600 text-sm">Status</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 
                          transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl 
                              flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Communication</h3>
                  <p className="text-2xl font-bold text-purple-600">24/7</p>
                  <p className="text-gray-600 text-sm">Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

       </div>
    </ProtectedRoute>
  )
}