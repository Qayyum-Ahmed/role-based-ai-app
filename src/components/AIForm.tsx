'use client'

import { useState } from 'react'
import './styles/aiform.css'

type FormData = {
  product: string
  brand: string
  color: string
  features: string
}

export default function AIForm() {
  const [formData, setFormData] = useState<FormData>({
    product: '',
    brand: '',
    color: '',
    features: '',
  })
  const [description, setDescription] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setDescription('')
    setImageUrl('')
    setError(null)

    try {
      // 1) Generate the text description
      const descRes = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (!descRes.ok) {
        const errorText = await descRes.text()
        throw new Error(errorText || 'Description generation failed')
      }
      
      const descJson = await descRes.json()
      if (descJson.error) throw new Error(descJson.error)
      
      const text: string = descJson.description
      setDescription(text)

      // 2) Generate the image from that description
      const imgRes = await fetch('/api/text-to-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      })
      
      if (!imgRes.ok) {
        const errorText = await imgRes.text()
        throw new Error(errorText || 'Image generation failed')
      }
      
      const imgJson = await imgRes.json()
      if (imgJson.error) throw new Error(imgJson.error)
      
      setImageUrl(imgJson.image) // this should be a data URL

    } catch (err: any) {
      console.error('Form submission error:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 animate-gradient-xy"></div>
      <div
      className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23818cf8' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30`}
    ></div>
      <div className="relative backdrop-blur-sm bg-white/80 p-8 rounded-3xl shadow-2xl max-w-2xl mx-auto border border-white/50 transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.02]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg transform hover:rotate-12 transition-all duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            AI Product Explorer
          </h2>
          <p className="text-gray-600 text-lg">Transform your ideas into stunning visuals with AI magic</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {(['product', 'brand', 'color', 'features'] as const).map((field, index) => (
            <div 
              key={field}
              className="transform transition-all duration-300 hover:translate-y-[-2px]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                {field === 'features' ? 'Features (comma separated)' : field}
              </label>
              <div className="relative group">
                <input
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={
                    field === 'features'
                      ? 'waterproof, wireless, fast charging...'
                      : `Enter ${field}...`
                  }
                  className="w-full border-2 border-gray-200 px-4 py-4 rounded-2xl text-lg font-medium bg-white/70 backdrop-blur-sm
                           focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-500/20 
                           transition-all duration-300 outline-none group-hover:border-gray-300
                           placeholder:text-gray-400"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 
                               group-focus-within:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="relative w-full group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl 
                          transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/40
                          group-disabled:from-gray-400 group-disabled:to-gray-500"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 rounded-2xl 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300
                          group-disabled:opacity-0"></div>
            <div className="relative px-8 py-4 text-white font-bold text-lg rounded-2xl flex items-center justify-center space-x-3">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span>Generating Magic...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Generate Text & Image</span>
                </>
              )}
            </div>
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl animate-shake">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Error occurred</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {description && (
          <div className="mt-8 animate-fadeInUp">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Generated Description</span>
            </h3>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 shadow-inner">
              <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line font-medium">{description}</p>
            </div>
          </div>
        )}

        {imageUrl && (
          <div className="mt-8 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Generated Image</span>
            </h3>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl blur-lg opacity-30 
                            group-hover:opacity-50 transition-opacity duration-300"></div>
              <img
                src={imageUrl}
                alt="AI generated"
                className="relative w-full max-h-96 object-contain rounded-3xl shadow-2xl border-4 border-white 
                         transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}