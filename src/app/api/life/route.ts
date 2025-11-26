import { NextResponse } from 'next/server'
import { getLifeFiles } from '../../../../lib/content'

export async function GET() {
    try {
        const lifeData = await getLifeFiles()
        return NextResponse.json(lifeData)
    } catch (error) {
        console.error('Error fetching life content:', error)
        return NextResponse.json({ error: 'Failed to fetch life content' }, { status: 500 })
    }
}
