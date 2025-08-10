'use client'

import ProtectedRoute from '../../../components/ProtectedRoute'
import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import MessageForm from '../../../components/MessageForm'
import MessageList from '../../../components/MessageList'
import './style.css';

export default function AdminPage() {
  const supabase = useSupabaseClient()
  const user = useUser()

  // For messaging
  const [recipients, setRecipients] = useState<{ id: string; name: string }[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  // For creating managers & team members
  const [mgr, setMgr] = useState({ name: '', email: '', password: '' })
  const [teamData, setTeamData] = useState({
    name: '',
    email: '',
    password: '',
    manager_id: '',
  })
  const [allManagers, setAllManagers] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState({
    recipients: true,
    managers: true,
    createManager: false,
    createTeam: false,
  })
  const [errors, setErrors] = useState({
    manager: '',
    team: '',
  })
  const [success, setSuccess] = useState({
    manager: false,
    team: false,
  })

  // Load all profiles for messaging dropdown
  useEffect(() => {
    const loadRecipients = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, role')
          .in('role', ['admin','manager','team','customer'])

        if (error) throw error
        if (data) setRecipients(data)
      } catch (error: any) {
        console.error('Error loading recipients:', error)
      } finally {
        setLoading(prev => ({ ...prev, recipients: false }))
      }
    }

    loadRecipients()
  }, [supabase])

  // Load only managers for team-member form
  useEffect(() => {
    const loadManagers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('role', 'manager')

        if (error) throw error
        if (data) setAllManagers(data)
      } catch (error: any) {
        console.error('Error loading managers:', error)
      } finally {
        setLoading(prev => ({ ...prev, managers: false }))
      }
    }

    loadManagers()
  }, [supabase])

  // Create Manager
  const createManager = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(prev => ({ ...prev, createManager: true }))
    setErrors(prev => ({ ...prev, manager: '' }))
    setSuccess(prev => ({ ...prev, manager: false }))

    try {
      if (!mgr.name || !mgr.email || !mgr.password) {
        throw new Error('All fields are required')
      }

      const res = await fetch('/api/create-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mgr),
      })

      const json = await res.json()
      
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create manager')
      }

      setMgr({ name: '', email: '', password: '' })
      setSuccess(prev => ({ ...prev, manager: true }))
      
      // Refresh managers list
      const { data } = await supabase.from('profiles').select('id, name').eq('role', 'manager')
      if (data) setAllManagers(data)

      setTimeout(() => setSuccess(prev => ({ ...prev, manager: false })), 3000)

    } catch (error: any) {
      setErrors(prev => ({ ...prev, manager: error.message }))
    } finally {
      setLoading(prev => ({ ...prev, createManager: false }))
    }
  }

  // Create Team Member
  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(prev => ({ ...prev, createTeam: true }))
    setErrors(prev => ({ ...prev, team: '' }))
    setSuccess(prev => ({ ...prev, team: false }))

    try {
      if (!teamData.name || !teamData.email || !teamData.password || !teamData.manager_id) {
        throw new Error('All fields are required')
      }

      const res = await fetch('/api/create-team-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      })

      const json = await res.json()
      
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create team member')
      }

      setTeamData({ name: '', email: '', password: '', manager_id: '' })
      setSuccess(prev => ({ ...prev, team: true }))

      setTimeout(() => setSuccess(prev => ({ ...prev, team: false })), 3000)

    } catch (error: any) {
      setErrors(prev => ({ ...prev, team: error.message }))
    } finally {
      setLoading(prev => ({ ...prev, createTeam: false }))
    }
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xl font-semibold text-gray-700">Loading admin panel...</span>
      </div>
    </div>
  )

  return (
    <ProtectedRoute role="admin">
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 relative overflow-hidden">
        {/* Background Decorations */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 viewBox=%220%200%20100%20100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill-rule=%22evenodd%22%3E%3Cg fill=%22%23f87171%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M50%2050c13.807%200%2025-11.193%2025-25S63.807%200%2050%200%2025%2011.193%2025%2025s11.193%2025%2025%2025zm0-10c8.284%200%2015-6.716%2015-15s-6.716-15-15-15-15%206.716-15%2015%206.716%2015%2015%2015z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="absolute top-20 right-20 w-80 h-80 bg-red-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slideInDown">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 
                          rounded-3xl mb-6 shadow-2xl transform hover:rotate-12 transition-all duration-500">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Admin Control Center
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage users, oversee operations, and maintain system integrity
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - User Management */}
            <div className="space-y-8">
              {/* Create Manager Form */}
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50 
                            transform transition-all duration-500 hover:shadow-3xl animate-slideInLeft">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl 
                                flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Add Manager</h2>
                </div>

                {errors.manager && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl animate-shake">
                    <p className="text-red-600 font-medium">{errors.manager}</p>
                  </div>
                )}

                {success.manager && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl animate-fadeInScale">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-600 font-medium">Manager created successfully!</p>
                    </div>
                  </div>
                )}

                <form onSubmit={createManager} className="space-y-4">
                  <input
                    value={mgr.name}
                    onChange={e => setMgr({...mgr, name: e.target.value})}
                    placeholder="Manager Name"
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg font-medium bg-white/70 backdrop-blur-sm
                             focus:border-green-500 focus:bg-white focus:shadow-lg focus:shadow-green-500/20 
                             transition-all duration-300 outline-none hover:border-gray-300"
                    disabled={loading.createManager}
                  />
                  <input
                    value={mgr.email}
                    onChange={e => setMgr({...mgr, email: e.target.value})}
                    placeholder="Manager Email"
                    type="email"
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg font-medium bg-white/70 backdrop-blur-sm
                             focus:border-green-500 focus:bg-white focus:shadow-lg focus:shadow-green-500/20 
                             transition-all duration-300 outline-none hover:border-gray-300"
                    disabled={loading.createManager}
                  />
                  <input
                    type="password"
                    value={mgr.password}
                    onChange={e => setMgr({...mgr, password: e.target.value})}
                    placeholder="Manager Password"
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg font-medium bg-white/70 backdrop-blur-sm
                             focus:border-green-500 focus:bg-white focus:shadow-lg focus:shadow-green-500/20 
                             transition-all duration-300 outline-none hover:border-gray-300"
                    disabled={loading.createManager}
                  />
                  <button 
                    type="submit" 
                    disabled={loading.createManager}
                    className="relative w-full group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl 
                                  transition-all duration-300 group-hover:shadow-xl group-hover:shadow-green-500/40
                                  group-disabled:from-gray-400 group-disabled:to-gray-500"></div>
                    <div className="relative px-6 py-3 text-white font-bold text-lg rounded-xl flex items-center justify-center space-x-2">
                      {loading.createManager ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Create Manager</span>
                        </>
                      )}
                    </div>
                  </button>
                </form>
              </div>

              {/* Create Team Member Form */}
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50 
                            transform transition-all duration-500 hover:shadow-3xl animate-slideInLeft" 
                   style={{ animationDelay: '200ms' }}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl 
                                flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Add Team Member</h2>
                </div>

                {errors.team && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl animate-shake">
                    <p className="text-red-600 font-medium">{errors.team}</p>
                  </div>
                )}

                {success.team && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl animate-fadeInScale">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-600 font-medium">Team member created successfully!</p>
                    </div>
                  </div>
                )}

                <form onSubmit={createTeam} className="space-y-4">
                  <input
                    value={teamData.name}
                    onChange={e => setTeamData({...teamData, name: e.target.value})}
                    placeholder="Team Member Name"
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg font-medium bg-white/70 backdrop-blur-sm
                             focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-500/20 
                             transition-all duration-300 outline-none hover:border-gray-300"
                    disabled={loading.createTeam}
                  />
                  <input
                    value={teamData.email}
                    onChange={e => setTeamData({...teamData, email: e.target.value})}
                    placeholder="Team Member Email"
                    type="email"
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg font-medium bg-white/70 backdrop-blur-sm
                             focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-500/20 
                             transition-all duration-300 outline-none hover:border-gray-300"
                    disabled={loading.createTeam}
                  />
                  <input
                    type="password"
                    value={teamData.password}
                    onChange={e => setTeamData({...teamData, password: e.target.value})}
                    placeholder="Team Member Password"
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg font-medium bg-white/70 backdrop-blur-sm
                             focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-500/20 
                             transition-all duration-300 outline-none hover:border-gray-300"
                    disabled={loading.createTeam}
                  />
                  <select
                    value={teamData.manager_id}
                    onChange={e => setTeamData({...teamData, manager_id: e.target.value})}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg font-medium bg-white/70 backdrop-blur-sm
                             focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-500/20 
                             transition-all duration-300 outline-none hover:border-gray-300 appearance-none"
                    disabled={loading.createTeam || loading.managers}
                  >
                    <option value="">Assign Manager</option>
                    {allManagers.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <button 
                    type="submit" 
                    disabled={loading.createTeam}
                    className="relative w-full group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl 
                                  transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/40
                                  group-disabled:from-gray-400 group-disabled:to-gray-500"></div>
                    <div className="relative px-6 py-3 text-white font-bold text-lg rounded-xl flex items-center justify-center space-x-2">
                      {loading.createTeam ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Create Team Member</span>
                        </>
                      )}
                    </div>
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
                  <h2 className="text-2xl font-bold text-gray-800">System Messages</h2>
                </div>

                {loading.recipients ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <MessageForm
                      toOptions={recipients}
                      role="admin"
                      toUserId={selectedUserId || undefined}
                    />

                    {/* User Selection */}
                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">View Conversation</label>
                      <select
                        className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg font-medium bg-white/70 backdrop-blur-sm
                                 focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 
                                 transition-all duration-300 outline-none hover:border-gray-300 appearance-none"
                        value={selectedUserId}
                        onChange={e => setSelectedUserId(e.target.value)}
                      >
                        <option value="">Select user to view conversation</option>
                        {recipients.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Conversation View */}
              {selectedUserId && (
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50 
                              transform transition-all duration-500 hover:shadow-3xl animate-fadeIn">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl 
                                  flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Conversation with {recipients.find(r => r.id === selectedUserId)?.name}
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    <MessageList withUser={selectedUserId} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-12 grid md:grid-cols-4 gap-6 animate-slideInUp">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 
                          transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl 
                              flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Admin Control</h3>
                  <p className="text-gray-600 text-sm">Full system access</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 
                          transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl 
                              flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Managers</h3>
                  <p className="text-gray-600 text-sm">{allManagers.length} active</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 
                          transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl 
                              flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Messages</h3>
                  <p className="text-gray-600 text-sm">{recipients.length} total users</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 
                          transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl 
                              flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Team Members</h3>
                  <p className="text-gray-600 text-sm">Under management</p>
                </div>
              </div>
            </div>
          </div>
        </div>

       </div>
    </ProtectedRoute>
  )
}