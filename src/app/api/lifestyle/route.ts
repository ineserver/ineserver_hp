import { NextResponse } from 'next/server'
import { getLifestyleFiles } from '../../../../lib/content'

export async function GET() {
  try {
    const lifestyleData = await getLifestyleFiles()
    return NextResponse.json(lifestyleData)
  } catch (error) {
    console.error('Error fetching lifestyle content:', error)
    return NextResponse.json({ error: 'Failed to fetch lifestyle content' }, { status: 500 })
  }
}
