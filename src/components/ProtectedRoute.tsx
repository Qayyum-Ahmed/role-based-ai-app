'use client'
import { ReactNode, useEffect, useState } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'

export default function ProtectedRoute({
  role,
  children,
}: {
  role: 'admin' | 'manager' | 'team' | 'customer'
  children: ReactNode
}) {
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!session) {
      router.replace('/login')
      return
    }
    supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data?.role !== role) router.replace('/')
        else setOk(true)
      })
  }, [session, role])

  if (!ok) return <div className="p-8">Loading…</div>
  return <>{children}</>
}
