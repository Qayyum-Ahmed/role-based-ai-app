'use client'

import ProtectedRoute from '../../../components/ProtectedRoute'
import AIForm from '../../../components/AIForm'
import MessageList from '../../../components/MessageList'
import MessageForm from '../../../components/MessageForm'
import { useEffect, useState } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import './style.css'

export default function CustomerDashboard() {
  const user = useUser()
  const supabase = useSupabaseClient()
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'ai' | 'messages'>('ai')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('role', 'team')

        if (error) {
          console.error('Error fetching team members:', error)
          return
        }

        if (data) setTeamMembers(data)
      } catch (error) {
        console.error('Unexpected error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeamMembers()
  }, [supabase])

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xl font-semibold text-gray-700">Loading your dashboard...</span>
      </div>
    </div>
  )

  return (
    <ProtectedRoute role="customer">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background Decorations */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220%200%2060%2060%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23818cf8%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>

        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slideInDown">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 
                          rounded-3xl mb-6 shadow-2xl transform hover:rotate-12 transition-all duration-500">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Welcome, {user.email?.split('@')[0]}!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore AI-powered product creation and connect with our support team
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8 animate-slideInUp">
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-xl border border-white/50">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`relative px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'ai'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>AI Explorer</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`relative px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'messages'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Messages</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {activeTab === 'ai' && (
              <div className="animate-fadeIn">
                <AIForm />
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="animate-fadeIn">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Message History */}
                  <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50 
                                transform transition-all duration-500 hover:shadow-3xl">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl 
                                    flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">Your Conversations</h2>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <MessageList withUser={user.id} />
                      )}
                    </div>
                  </div>

                  {/* Team Members & Messaging */}
                  <div className="space-y-6">
                    {/* Team Members List */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-white/50 
                                  transform transition-all duration-500 hover:shadow-3xl">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl 
                                      flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Our Support Team</h3>
                      </div>
                      
                      {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : teamMembers.length > 0 ? (
                        <div className="space-y-3">
                          {teamMembers.map((member, index) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 
                                       rounded-2xl border border-gray-200 transform transition-all duration-300 
                                       hover:shadow-lg hover:scale-[1.02] animate-slideInRight"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 
                                              rounded-xl flex items-center justify-center shadow-md">
                                  <span className="text-white font-bold text-sm">
                                    {member.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-800">{member.name}</span>
                              </div>
                              <button
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white 
                                         rounded-xl font-semibold text-sm shadow-lg transform transition-all duration-300 
                                         hover:scale-105 hover:shadow-xl hover:from-blue-600 hover:to-purple-700"
                                onClick={() => {
                                  setSelectedUserId(null)
                                  setTimeout(() => setSelectedUserId(member.id), 0)
                                }}
                              >
                                Message
                              </button>
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
                          <p className="text-gray-500 font-medium">No team members available at the moment</p>
                        </div>
                      )}
                    </div>

                    {/* Message Form */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-white/50 
                                  transform transition-all duration-500 hover:shadow-3xl">
                      <MessageForm
                        key={selectedUserId ?? 'default'}
                        toOptions={teamMembers}
                        role="customer"
                        toUserId={selectedUserId ?? undefined}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 animate-slideInUp">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 
                          transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl 
                              flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">AI Explorer</h3>
                  <p className="text-gray-600 text-sm">Create product descriptions & images</p>
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
                  <h3 className="font-bold text-gray-800">Team Support</h3>
                  <p className="text-gray-600 text-sm">{teamMembers.length} members ready to help</p>
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
                  <h3 className="font-bold text-gray-800">Customer Care</h3>
                  <p className="text-gray-600 text-sm">24/7 dedicated support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}