import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { gbpService } from '@/lib/google/business-profile'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const locations = await gbpService.listLocations()

    return NextResponse.json({
      success: true,
      locations,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
