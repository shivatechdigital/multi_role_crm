import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { gscService } from "@/lib/google/search-console"
import { ga4Service } from "@/lib/google/analytics"
import { getDateRange } from "@/lib/utils/dates"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { days = 7 } = await request.json()
    const { startDate, endDate } = getDateRange(days)

    const [seo, analytics] = await Promise.all([
      gscService.getOverallMetrics(startDate, endDate),
      ga4Service.getOverallMetrics(startDate, endDate),
    ])

    return NextResponse.json({
      success: true,
      report: {
        dateRange: `${startDate} → ${endDate}`,
        seo,
        analytics,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Report generation failed" },
      { status: 500 }
    )
  }
}
