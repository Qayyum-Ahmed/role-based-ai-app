import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 viewBox=%220%200%20100%20100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill-rule=%22evenodd%22%3E%3Cg fill=%22%23f87171%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M50%2050c13.807%200%2025-11.193%2025-25S63.807%200%2050%200%2025%2011.193%2025%2025s11.193%2025%2025%2025zm0-10c8.284%200%2015-6.716%2015-15s-6.716-15-15-15-15%206.716-15%2015%206.716%2015%2015%2015z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      <div className="absolute top-20 right-20 w-80 h-80 bg-red-300/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 animate-slideInDown">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-6">
          Welcome to Support AI
        </h1>
        <div className="flex justify-center gap-6">
          <Link
            href="/signup"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-semibold shadow-lg hover:shadow-green-500/30 transition-all duration-300"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
