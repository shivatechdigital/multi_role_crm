import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { canManageLeads, getUserRole } from '@/lib/auth/permissions'
import {
  isLeadDetailsEmailConfigured,
  sendLeadDetailsEmail,
} from '@/lib/notifications/lead-details-email'

// GET - List all leads
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = getUserRole(session.user.role)
    const canViewAllLeads = canManageLeads(role)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const search = searchParams.get('search')

    const where: any = {}
    if (status) where.status = status
    if (source) where.source = source
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (!canViewAllLeads) {
      where.assignedTo = session.user.id
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: {
          select: { activities: true },
        },
      },
    })

    // Calculate stats
    const scopeWhere = canViewAllLeads ? {} : { assignedTo: session.user.id }
    const totalLeads = await prisma.lead.count({ where: scopeWhere })
    const newLeads = await prisma.lead.count({ where: { ...scopeWhere, status: 'NEW' } })
    const qualifiedLeads = await prisma.lead.count({ where: { ...scopeWhere, status: 'QUALIFIED' } })
    const wonLeads = await prisma.lead.count({ where: { ...scopeWhere, status: 'WON' } })
    
    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)
    const recentLeads = await prisma.lead.count({
      where: { ...scopeWhere, createdAt: { gte: last7Days } },
    })

    return NextResponse.json({
      success: true,
      stats: {
        total: totalLeads,
        new: newLeads,
        qualified: qualifiedLeads,
        won: wonLeads,
        recent: recentLeads,
      },
      leads,
    })
  } catch (error: any) {
    console.error('Leads GET Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

// POST - Create new lead
export async function POST(request: Request) {
  try {
    const body = await request.json()
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
      ipAddress,
      userAgent,
      referrer,
    } = body

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // AI Lead Scoring (basic logic)
    let score = 50
    if (budget) {
      if (budget.includes('1L+') || budget.includes('5L+')) score += 30
      else if (budget.includes('50k')) score += 15
    }
    if (company) score += 10
    if (phone) score += 10
    if (message && message.length > 50) score += 10
    if (source === 'referral') score += 20

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

    let leadEmailSent = false
    let leadEmailError: string | null = null

    if (email && isLeadDetailsEmailConfigured()) {
      try {
        const appName = process.env.APP_NAME?.trim() || 'Multi-Role CRM'

        await sendLeadDetailsEmail({
          to: email,
          appName,
          lead: {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            service: lead.service,
            budget: lead.budget,
            source: lead.source,
            message: lead.message,
            status: lead.status,
            score: lead.score,
            createdAt: lead.createdAt,
          },
        })
        leadEmailSent = true
      } catch (error: any) {
        console.error('Lead details email error:', error)
        leadEmailError = error?.message || 'Failed to send lead details email'
      }
    }

    return NextResponse.json({
      success: true,
      lead,
      leadEmailSent,
      leadEmailError,
      message: 'Lead created successfully',
    })
  } catch (error: any) {
    console.error('Lead POST Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create lead' },
      { status: 500 }
    )
  }
}
