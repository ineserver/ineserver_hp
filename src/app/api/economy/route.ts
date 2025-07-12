import { NextResponse } from 'next/server'
import { getEconomyFiles } from '../../../../lib/content'

export async function GET() {
  try {
    const economyData = await getEconomyFiles()
    return NextResponse.json(economyData)
  } catch (error) {
    console.error('Error fetching economy content:', error)
    return NextResponse.json({ error: 'Failed to fetch economy content' }, { status: 500 })
  }
}
