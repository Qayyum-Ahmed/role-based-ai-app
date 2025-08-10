import './globals.css'
import AuthProvider from '../components/AuthProvider'
import NavBar from '../components/NavBar'

export const metadata = {
  title: 'Support AI App',
  description: 'Customer support with AI assistant',
}

export default function RootLayout({
  children,
  initialSession,
}: {
  children: React.ReactNode
  initialSession?: any
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider initialSession={initialSession ?? null}>
          <NavBar />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
