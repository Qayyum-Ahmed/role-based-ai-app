// src/app/api/text-to-image/route.ts
import { NextRequest, NextResponse } from 'next/server'

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY_2!
// Use the new endpoint and model from your reference code
const MODEL = 'stabilityai/stable-diffusion-xl-base-1.0'
const URL = `https://router.huggingface.co/hf-inference/models/${MODEL}`

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()
  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    // Send the prompt in the correct format as shown in the reference code
    body: JSON.stringify({ inputs: prompt }),
  })

  if (!res.ok) {
    const txt = await res.text()
    console.error('HF T2I error:', txt)
    return NextResponse.json({ error: txt }, { status: res.status })
  }

  // The API returns a binary image, not JSON.
  const blob = await res.blob()
  const arrayBuffer = await blob.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Determine the correct image type from the response header
  const contentType = res.headers.get('Content-Type') || 'image/jpeg' 
  
  // Create a data URL from the buffer and content type
  const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`

  return NextResponse.json({ image: dataUrl })
}