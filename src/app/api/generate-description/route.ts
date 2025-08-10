import { NextRequest, NextResponse } from 'next/server'

// It's recommended to use the OpenAI library for better type safety and handling,
// but for a simple fetch call, this approach works.
// You will need to set HUGGINGFACE_API_KEY in your .env.local file.
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY_1!

// The router endpoint is compatible with many chat models.
// I've updated this to a popular instruction-following model available via the router.
// The ':together' suffix indicates the provider to use.
const HF_MODEL = 'Qwen/Qwen3-Coder-480B-A35B-Instruct'

export async function POST(req: NextRequest) {
  try {
    const { product, brand, color, features } = await req.json()

    if (!product || !brand || !color || !features) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Construct the prompt as a user message for the chat model
    const prompt = `Write a short 3 line, catchy description for a ${color} ${brand} ${product} with features: ${features}.`

    // The router uses an OpenAI-compatible endpoint for chat completions
    const hfResponse = await fetch(`https://router.huggingface.co/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // The model is now specified in the request body
        model: HF_MODEL,
        // The prompt is sent as an array of messages
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        // The router accepts OpenAI-compatible parameters
        max_tokens: 60,
        temperature: 0.7,
      }),
    })

    const result = await hfResponse.json()

    // Handle potential errors from the API
    if (result.error) {
      console.error('Hugging Face API Error:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // The response structure is also OpenAI-compatible, with `choices` and `message`
    const text = result.choices[0]?.message?.content || 'No description generated.'
    return NextResponse.json({ description: text })
  } catch (error: any) {
    console.error('An unexpected error occurred:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

