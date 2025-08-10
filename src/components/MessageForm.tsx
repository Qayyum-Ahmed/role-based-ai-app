'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import './styles/msgform.css'

type Props = {
  toOptions: { id: string; name: string }[]
  role: string
  toUserId?: string
}

export default function MessageForm({ toOptions, role, toUserId }: Props) {
  const supabase = useSupabaseClient()
  const user = useUser()

  const [message, setMessage] = useState('')
  const [recipient, setRecipient] = useState<string | undefined>(toUserId)
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Sync recipient when external toUserId changes
  useEffect(() => {
    setRecipient(toUserId)
  }, [toUserId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!recipient) {
      setErrorMessage('Please select a recipient')
      setStatus('error')
      setTimeout(() => {
        setStatus('idle')
        setErrorMessage('')
      }, 3000)
      return
    }

    if (!message.trim()) {
      setErrorMessage('Please enter a message')
      setStatus('error')
      setTimeout(() => {
        setStatus('idle')
        setErrorMessage('')
      }, 3000)
      return
    }

    if (!user?.id) {
      setErrorMessage('Authentication required')
      setStatus('error')
      setTimeout(() => {
        setStatus('idle')
        setErrorMessage('')
      }, 3000)
      return
    }

    setStatus('sending')
    setErrorMessage('')

    try {
      const { error } = await supabase.from('messages').insert([
        {
          sender_id: user.id,
          recipient_id: recipient,
          content: message.trim(),
        },
      ])

      if (error) {
        throw new Error(error.message || 'Failed to send message')
      }

      setMessage('')
      setStatus('sent')
      setTimeout(() => setStatus('idle'), 3000)

    } catch (error: any) {
      console.error('Message send error:', error)
      setErrorMessage(error.message || 'Failed to send message. Please try again.')
      setStatus('error')
      setTimeout(() => {
        setStatus('idle')
        setErrorMessage('')
      }, 5000)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold">Sending...</span>
          </div>
        )
      case 'sent':
        return (
          <div className="flex items-center space-x-2 text-green-600 animate-fadeInScale">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-semibold">Message sent!</span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-red-600 animate-shake">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="font-semibold">Failed to send</span>
          </div>
        )
      default:
        return null
    }
  }

  const disabled = status === 'sending'
  const canSubmit = !disabled && message.trim() && recipient

  return (
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl opacity-50"></div>
      
      <form onSubmit={sendMessage} className="relative space-y-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Send Message</h3>
        </div>

        {/* Recipient Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Send to</label>
          <div className="relative group">
            <select
              value={recipient ?? ''}
              onChange={e => setRecipient(e.target.value)}
              className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg font-medium bg-white/70 backdrop-blur-sm
                       focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 
                       transition-all duration-300 outline-none group-hover:border-gray-300
                       appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled}
            >
              <option value="">Select recipient...</option>
              {toOptions.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Message</label>
          <div className="relative group">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl text-lg font-medium bg-white/70 backdrop-blur-sm
                       focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 
                       transition-all duration-300 outline-none group-hover:border-gray-300 resize-none
                       placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Type your message here..."
              rows={4}
              disabled={disabled}
              maxLength={1000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
              {message.length}/1000
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 
                           group-focus-within:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        {/* Error Message */}
        {status === 'error' && errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-red-800 font-semibold text-sm">Error</h4>
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button and Status */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`relative group overflow-hidden px-8 py-3 rounded-xl font-bold text-lg shadow-lg
                       transform transition-all duration-300 flex-1 mr-4
                       ${canSubmit 
                         ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02] hover:from-blue-600 hover:to-purple-700' 
                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                       }`}
            disabled={!canSubmit}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 
                           ${canSubmit ? 'group-hover:opacity-100' : ''} transition-opacity duration-300`}></div>
            <span className="relative z-10 flex items-center justify-center space-x-2">
              {status === 'sending' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send Message</span>
                </>
              )}
            </span>
          </button>

          {/* Status Indicator */}
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
        </div>

        {/* Message Tips */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {role === 'customer' && 'Reach out to our team members for support and assistance'}
              {role === 'team' && 'Reply to customer inquiries and collaborate with your team'}
              {role === 'manager' && 'Communicate with your team members and coordinate tasks'}
              {role === 'admin' && 'Send messages to any user in the system'}
            </span>
          </div>
        </div>
      </form>
    </div>
  )
}