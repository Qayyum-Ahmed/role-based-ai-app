'use client'

import ProtectedRoute from '../../../components/ProtectedRoute'
import MessageList from '../../../components/MessageList'
import MessageForm from '../../../components/MessageForm'
import { useEffect, useState } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'

export default function TeamPage() {
  const user = useUser()
  const supabase = useSupabaseClient()

  const [manager, setManager] = useState<{ id: string; name: string } | null>(null)
  const [teammates, setTeammates] = useState<{ id: string; name: string }[]>([])
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return

    const fetchData = async () => {
      // 1) Fetch manager & teammates (unchanged)
      const managerId = user.user_metadata?.manager_id
      if (managerId) {
        const { data: mgr } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', managerId)
          .single()
        if (mgr) setManager(mgr)

        const { data: team } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('manager_id', managerId)
          .eq('role', 'team')
          .neq('id', user.id)
        if (team) setTeammates(team)
      }

      // 2) Fetch all messages sent to this team member by customers
      const { data: msgs } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('recipient_id', user.id)
        .neq('sender_id', user.id)

      if (!msgs?.length) {
        setCustomers([])
        return
      }

      // 3) Dedupe sender IDs
      const uniqueIds = Array.from(new Set(msgs.map(m => m.sender_id)))

      // 4) Fetch those profiles, filtering to customers
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', uniqueIds)
        .eq('role', 'customer')

      setCustomers(profs || [])
    }

    fetchData()
  }, [user?.id, supabase])

  if (!user) return <div className="p-8">Loading...</div>

  return (
    <ProtectedRoute role="team">
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold">Team Dashboard</h1>

        {/* Your Manager */}
        {manager && (
          <div className="bg-gray-100 p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Your Manager</h2>
            <p>{manager.name}</p>
            <button
              className="text-blue-600 underline mt-2"
              onClick={() => {
                setSelectedUserId(null)
                setTimeout(() => setSelectedUserId(manager.id), 0)
              }}
            >
              Message
            </button>
          </div>
        )}

        {/* Your Teammates */}
        {teammates.length > 0 && (
          <div className="bg-gray-100 p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Your Teammates</h2>
            <ul className="list-disc list-inside">
              {teammates.map(t => (
                <li key={t.id} className="flex items-center">
                  <span>{t.name}</span>
                  <button
                    className="text-blue-600 underline ml-2"
                    onClick={() => {
                      setSelectedUserId(null)
                      setTimeout(() => setSelectedUserId(t.id), 0)
                    }}
                  >
                    Message
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Incoming Messages */}
        <section>
          <h2 className="text-2xl mb-4">Incoming Messages</h2>
          <MessageList withUser={user.id} />
        </section>

        {/* Reply to Customers */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-2xl mb-4">Reply to Customers</h2>
          {customers.length > 0 ? (
            <MessageForm
              key={selectedUserId ?? 'default'}
              toOptions={customers}
              role="team"
              toUserId={selectedUserId ?? undefined}
            />
          ) : (
            <p className="text-gray-600">
              No customer messages to reply to.
            </p>
          )}
        </section>
      </div>
    </ProtectedRoute>
  )
}
