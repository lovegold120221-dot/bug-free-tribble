import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url')
    if (!url) {
        return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }
    
    // Redirect to the provided sandbox URL
    return NextResponse.redirect(url)
}
