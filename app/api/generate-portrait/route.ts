import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const guestName = searchParams.get('name') || 'Unknown Guest'

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Pixel art portrait of ${guestName}, front-facing character sprite, Pokémon Diamond and Pearl Nintendo DS game style, trainer sprite, 64x64 pixels, simple pixel art, limited retro color palette, professional attire, white background, no text, no borders`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
    })

    const url = response.data?.[0]?.url ?? null
    return NextResponse.json({ url })
  } catch (error) {
    console.error('OpenAI image generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate portrait' },
      { status: 500 }
    )
  }
}
