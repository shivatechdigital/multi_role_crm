// src/lib/types/opportunities.ts

export interface Opportunity {
  type: 'quick_win' | 'ctr_issue' | 'striking_distance' | 'declining' | 'rising'
  priority: 'high' | 'medium' | 'low'
  keyword?: string
  page?: string
  currentPosition: number
  currentClicks: number
  currentImpressions: number
  currentCtr: number
  potentialClicks: number
  potentialGain: number
  reasoning: string
  recommendations: string[]
  impactScore: number
}

export interface OpportunitiesStats {
  totalOpportunities: number
  quickWinsCount: number
  ctrIssuesCount: number
  strikingDistanceCount: number
  potentialTraffic: number
  highPriorityCount: number
}

export interface OpportunitiesResponse {
  success: boolean
  dateRange: {
    startDate: string
    endDate: string
    days: number
  }
  stats: OpportunitiesStats
  opportunities: {
    quickWins: Opportunity[]
    strikingDistance: Opportunity[]
    ctrIssues: Opportunity[]
    pageCtrIssues: Opportunity[]
    topOpportunities: Opportunity[]
  }
}
