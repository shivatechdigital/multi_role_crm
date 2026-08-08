"use client"

import { useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { Download, FileText } from "lucide-react"
import { useDateRangeStore } from "@/store/date-range-store"
import { toast } from "sonner"
import { useSession } from 'next-auth/react'
import { canManageOperations, getUserRole } from '@/lib/auth/permissions'

export default function ReportsPage() {
  const { data: session } = useSession()
  const days = useDateRangeStore((s) => s.days)
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const canGenerate = canManageOperations(getUserRole(session?.user?.role))

  const generateReport = async () => {
    if (!canGenerate) {
      toast.error('Only managers and admins can generate reports')
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post("/api/reports/generate", { days })
      setReport(data.report)
      toast.success("Report generated")
    } catch (err) {
      toast.error("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report-${Date.now()}.json`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports 📑</h1>
        <p className="text-muted-foreground">
          Generate performance reports
        </p>
      </div>

      <DateRangePicker />

      <Button onClick={generateReport} disabled={loading}>
        <FileText className="w-4 h-4 mr-2" />
        {loading ? "Generating..." : "Generate Report"}
      </Button>

      {!canGenerate && (
        <p className="text-sm text-muted-foreground">
          Report generation is restricted to managers and admins.
        </p>
      )}

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Date:</strong> {report.dateRange}</p>
            <p><strong>Clicks:</strong> {report.seo.clicks}</p>
            <p><strong>Impressions:</strong> {report.seo.impressions}</p>
            <p><strong>Users:</strong> {report.analytics.users}</p>
            <p><strong>Sessions:</strong> {report.analytics.sessions}</p>

            <Button onClick={downloadJSON} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download JSON
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
