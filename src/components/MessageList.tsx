'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import './styles/msglist.css'

type Message = {
  id: string
  content: string
  created_at: string
  sender_id: string
  recipient_id: string
  sender?: { name: string }
  recipient?: { name: string }
}

export default function MessageList({ withUser }: { withUser: string }) {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMessages = async () => {
      if (!withUser) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*, sender:sender_id(name), recipient:recipient_id(name)')
          .or(`sender_id.eq.${withUser},recipient_id.eq.${withUser}`)
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw new Error(fetchError.message)
        }

        setMessages(data || [])
      } catch (err: any) {
        console.error('Error loading messages:', err)
        setError(err.message || 'Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    loadMessages()

    // Set up real-time subscription
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `sender_id.eq.${withUser},recipient_id.eq.${withUser}`,
      }, () => {
        // Reload messages when changes occur
        loadMessages()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [withUser, supabase])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getMessageDirection = (msg: Message) => {
    return msg.sender_id === user?.id ? 'sent' : 'received'
  }

  const getMessageSenderName = (msg: Message) => {
    if (msg.sender_id === user?.id) {
      return 'You'
    }
    return msg.sender?.name || 'Unknown User'
  }

  const getMessageRecipientName = (msg: Message) => {
    if (msg.recipient_id === user?.id) {
      return 'You'
    }
    return msg.recipient?.name || 'Unknown User'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Loading messages...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Messages</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl 
                      flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No messages yet</h3>
        <p className="text-gray-500">Start a conversation to see messages here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((msg, index) => {
        const direction = getMessageDirection(msg)
        const isFromUser = direction === 'sent'
        
        return (
          <div
            key={msg.id}
            className={`flex ${isFromUser ? 'justify-end' : 'justify-start'} animate-slideInMessage`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isFromUser ? 'order-2' : 'order-1'}`}>
              {/* Message Bubble */}
              <div className={`relative p-4 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                ${isFromUser 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                }`}>
                
                {/* Message Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {/* Avatar */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md
                      ${isFromUser 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gradient-to-br from-gray-400 to-gray-600 text-white'
                      }`}>
                      {getMessageSenderName(msg).charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-sm font-semibold ${isFromUser ? 'text-white/90' : 'text-gray-700'}`}>
                      {getMessageSenderName(msg)}
                    </span>
                    {!isFromUser && (
                      <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium`}>
                        to {getMessageRecipientName(msg)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className={`text-sm leading-relaxed mb-3 ${isFromUser ? 'text-white' : 'text-gray-800'}`}>
                  {msg.content}
                </div>

                {/* Timestamp */}
                <div className={`text-xs flex justify-end ${isFromUser ? 'text-white/70' : 'text-gray-500'}`}>
                  <span className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatDate(msg.created_at)}</span>
                  </span>
                </div>

                {/* Message Tail */}
                <div className={`absolute top-4 ${isFromUser ? '-right-2' : '-left-2'} w-4 h-4 transform rotate-45 
                  ${isFromUser 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                    : 'bg-white border-l border-b border-gray-200'
                  }`}></div>
              </div>
            </div>

            {/* User Avatar (for spacing) */}
            <div className={`w-10 h-10 ${isFromUser ? 'order-1 mr-3' : 'order-2 ml-3'} flex-shrink-0`}>
              <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-white shadow-lg transform transition-all duration-300 hover:scale-110
                ${isFromUser 
                  ? 'bg-gradient-to-br from-blue-400 to-purple-500' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
                }`}>
                {isFromUser 
                  ? (user?.email?.charAt(0) || 'U').toUpperCase()
                  : getMessageSenderName(msg).charAt(0).toUpperCase()
                }
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}