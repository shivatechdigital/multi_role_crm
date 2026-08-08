import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Public webhook - no auth required
// Use this URL in your website contact forms
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const headers = request.headers

    const {
      name,
      email,
      phone,
      company,
      service,
      budget,
      message,
      source = 'website',
      utmSource,
      utmMedium,
      utmCampaign,
    } = body

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Get request metadata
    const ipAddress = headers.get('x-forwarded-for') || 'unknown'
    const userAgent = headers.get('user-agent') || ''
    const referrer = headers.get('referer') || ''

    // AI Scoring
    let score = 50
    if (budget) {
      if (budget.includes('1L+') || budget.includes('5L+')) score += 30
      else if (budget.includes('50k')) score += 15
    }
    if (company) score += 10
    if (phone) score += 10
    if (message && message.length > 50) score += 10

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company,
        service,
        budget,
        message,
        source,
        score: Math.min(score, 100),
        utmSource,
        utmMedium,
        utmCampaign,
        ipAddress,
        userAgent,
        referrer,
        status: 'NEW',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you! We will contact you soon.',
      leadId: lead.id,
    })
  } catch (error: any) {
    console.error('Webhook Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit form. Please try again.' },
      { status: 500 }
    )
  }
}

// GET - Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'lead webhook',
    method: 'POST',
    requiredFields: ['name', 'email'],
    optionalFields: ['phone', 'company', 'service', 'budget', 'message'],
  })
}
