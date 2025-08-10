import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabaseUser = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabaseUser.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = session.user.user_metadata.role
  if (userRole !== 'manager' && userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Managers or Admins only' }, { status: 403 })
  }

  const { name, email, password } = await req.json()

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'team' },
  })

  if (createError || !userData?.user) {
    return NextResponse.json({ error: createError?.message || 'User creation failed' }, { status: 500 })
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: userData.user.id,
    name,
    email,
    role: 'team',
    manager_id: session.user.id,   // assigned to this manager/admin
    created_by: session.user.id,   // tracking creator
  })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userData.user.id)  // rollback
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ user: userData.user })
}
