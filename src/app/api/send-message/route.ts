import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

async function isMessageAllowed(supabase: any, senderId: string, senderRole: string, recipient: any) {
  const recipientRole = recipient.role

  if (senderRole === 'admin') {
    return ['manager', 'team', 'customer'].includes(recipientRole)
  }

  if (senderRole === 'manager') {
    return recipientRole === 'team' && recipient.manager_id === senderId
  }

  if (senderRole === 'team') {
    const { data: prevMsg } = await supabase
      .from('messages')
      .select('id')
      .eq('sender_id', recipient.id)
      .eq('recipient_id', senderId)
      .limit(1)
      .maybeSingle()
    return recipientRole === 'customer' && !!prevMsg
  }

  if (senderRole === 'customer') {
    return recipientRole === 'team'
  }

  return false
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const senderId = session.user.id
  const senderRole = session.user.user_metadata.role
  const { recipient_id, content, broadcast } = await req.json()

  if (!content) return NextResponse.json({ error: 'Missing message content' }, { status: 400 })

  if (broadcast && senderRole === 'admin') {
    const { data: recipients } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['manager', 'team', 'customer'])

    const messages = (recipients || []).map((r: any) => ({
      sender_id: senderId,
      recipient_id: r.id,
      content,
    }))

    const { error: bulkError } = await supabase.from('messages').insert(messages)
    if (bulkError) return NextResponse.json({ error: bulkError.message }, { status: 500 })

    return NextResponse.json({ success: true })
  }

  if (!recipient_id) return NextResponse.json({ error: 'Missing recipient' }, { status: 400 })

  const { data: recipient, error } = await supabase
    .from('profiles')
    .select('id, role, manager_id')
    .eq('id', recipient_id)
    .single()

  if (error || !recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })

  const allowed = await isMessageAllowed(supabase, senderId, senderRole, recipient)
  if (!allowed) return NextResponse.json({ error: 'Not allowed to message this user' }, { status: 403 })

  const { error: msgError } = await supabase.from('messages').insert({
    sender_id: senderId,
    recipient_id,
    content,
  })

  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
