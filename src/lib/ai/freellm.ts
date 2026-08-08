const FREELLM_URL = process.env.FREELLM_API_URL || 'http://34.100.232.200:5173/v1/chat/completions'
const FREELLM_KEY = process.env.FREELLM_API_KEY || 'freellmapi-73b96179a62017c62886a173d174016f8a81a7f6fb94414d'

export type AIProvider = 'groq' | 'google' | 'openrouter' | 'huggingface'

export interface AIRequest {
  prompt: string
  systemPrompt?: string
  provider?: AIProvider
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface AIResponse {
  content: string
  provider: string
  model: string
  tokensUsed?: number
}

const MODELS = {
  groq: 'auto',
  google: 'auto',
  openrouter: 'auto',
  huggingface: 'auto',
}

class FreeLLMService {
  /**
   * Generate AI completion
   */
  async generate(request: AIRequest): Promise<AIResponse> {
    const {
      prompt,
      systemPrompt = 'You are an expert SEO and digital marketing analyst. Be concise, actionable, and use simple language.',
      provider = 'groq',
      model = MODELS[provider],
      temperature = 0.3,
      maxTokens = 1000,
    } = request

    try {
      const response = await fetch(FREELLM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FREELLM_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`FreeLLM API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      
      return {
        content: data.choices?.[0]?.message?.content || '',
        provider,
        model,
        tokensUsed: data.usage?.total_tokens,
      }
    } catch (error) {
      console.error('FreeLLM Error:', error)
      throw error
    }
  }

  /**
   * Generate SEO insights from data
   */
  async analyzeSEO(data: any): Promise<string> {
    const prompt = `Analyze this SEO data and provide insights in Hindi-English mix (Hinglish):

SEO Metrics (Last 7 Days):
- Total Clicks: ${data.clicks || 0}
- Total Impressions: ${data.impressions || 0}
- Average CTR: ${data.ctr?.toFixed(2) || 0}%
- Average Position: ${data.position?.toFixed(1) || 0}

Top 5 Keywords:
${(data.topKeywords || []).slice(0, 5).map((k: any, i: number) => 
  `${i + 1}. "${k.keyword}" - Position ${k.position?.toFixed(1)}, ${k.clicks} clicks, ${k.impressions} impressions`
).join('\n')}

Top 5 Pages:
${(data.topPages || []).slice(0, 5).map((p: any, i: number) => 
  `${i + 1}. ${p.page} - ${p.clicks} clicks, Position ${p.position?.toFixed(1)}`
).join('\n')}

Provide insights in this EXACT format:

## 📊 Performance Summary
[2-3 lines summary in Hinglish]

## ✅ What's Working Well
- [Point 1]
- [Point 2]
- [Point 3]

## ⚠️ Areas of Concern
- [Issue 1]
- [Issue 2]

## 🎯 Top 3 Action Items
1. [Specific actionable step]
2. [Specific actionable step]
3. [Specific actionable step]

## 💡 Quick Wins
[1-2 immediate opportunities]

Keep it short, actionable, and motivating.`

    const response = await this.generate({
      prompt,
      systemPrompt: 'You are an expert SEO analyst. Provide insights in Hindi-English mix (Hinglish). Be friendly, specific, and actionable.',
      temperature: 0.5,
    })

    return response.content
  }

  /**
   * Detect anomalies in metrics
   */
  async detectAnomalies(current: any, previous: any): Promise<string> {
    const changes = {
      clicks: this.calculateChange(current.clicks, previous.clicks),
      impressions: this.calculateChange(current.impressions, previous.impressions),
      ctr: this.calculateChange(current.ctr, previous.ctr),
      position: this.calculateChange(current.position, previous.position, true), // lower is better
    }

    const prompt = `Analyze these SEO metric changes:

Current Period:
- Clicks: ${current.clicks}
- Impressions: ${current.impressions}
- CTR: ${current.ctr?.toFixed(2)}%
- Avg Position: ${current.position?.toFixed(1)}

Previous Period:
- Clicks: ${previous.clicks}
- Impressions: ${previous.impressions}
- CTR: ${previous.ctr?.toFixed(2)}%
- Avg Position: ${previous.position?.toFixed(1)}

Changes:
- Clicks: ${changes.clicks > 0 ? '+' : ''}${changes.clicks.toFixed(1)}%
- Impressions: ${changes.impressions > 0 ? '+' : ''}${changes.impressions.toFixed(1)}%
- CTR: ${changes.ctr > 0 ? '+' : ''}${changes.ctr.toFixed(1)}%
- Position: ${changes.position > 0 ? 'improved by' : 'dropped by'} ${Math.abs(changes.position).toFixed(1)}

Identify any anomalies (sudden drops > 20% or spikes). Provide brief analysis in Hinglish:

## 🔍 Anomaly Detection
[List any significant changes]

## 💭 Likely Causes
[Possible reasons]

## 🚀 Recommended Actions
[2-3 specific steps]

Be concise (max 200 words).`

    const response = await this.generate({
      prompt,
      temperature: 0.4,
    })

    return response.content
  }

  /**
   * Generate content ideas based on top keywords
   */
  async generateContentIdeas(keywords: any[]): Promise<string> {
    const topKeywords = keywords.slice(0, 10).map((k: any) => k.keyword).join(', ')

    const prompt = `Based on these top performing keywords, suggest 5 blog post ideas:

Top Keywords: ${topKeywords}

For each idea provide:
1. Catchy title (SEO-friendly)
2. Target keywords (2-3)
3. Brief outline (3 points)
4. Estimated word count
5. Why this will rank

Format in Hinglish. Be specific and actionable.`

    const response = await this.generate({
      prompt,
      systemPrompt: 'You are a content marketing expert. Generate SEO-optimized blog ideas in Hinglish.',
      temperature: 0.7,
      maxTokens: 1500,
    })

    return response.content
  }

  /**
   * Identify keyword opportunities
   */
  async findOpportunities(keywords: any[]): Promise<string> {
    // Find keywords on page 2 (positions 11-20)
    const page2Keywords = keywords
      .filter((k: any) => k.position > 10 && k.position <= 20)
      .slice(0, 10)

    // Find low CTR keywords
    const lowCTRKeywords = keywords
      .filter((k: any) => k.position <= 10 && k.ctr < 2 && k.impressions > 100)
      .slice(0, 5)

    const prompt = `Analyze these SEO opportunities:

QUICK WIN KEYWORDS (Page 2 - Push to Page 1):
${page2Keywords.map((k: any, i: number) => 
  `${i + 1}. "${k.keyword}" - Position ${k.position?.toFixed(1)}, ${k.impressions} impressions`
).join('\n')}

LOW CTR KEYWORDS (Top 10 but low clicks):
${lowCTRKeywords.map((k: any, i: number) => 
  `${i + 1}. "${k.keyword}" - Position ${k.position?.toFixed(1)}, CTR ${k.ctr?.toFixed(2)}%`
).join('\n')}

Provide actionable strategy:

## 🎯 Quick Wins (1-2 weeks)
[Top 3 keywords to focus on]

## 📈 CTR Optimization
[How to improve click rates]

## 🔧 Specific Actions
[Tactical recommendations]

Be specific, time-bound, and use Hinglish.`

    const response = await this.generate({
      prompt,
      temperature: 0.5,
      maxTokens: 1200,
    })

    return response.content
  }

  private calculateChange(current: number, previous: number, inverted = false): number {
    if (!previous) return 0
    const change = ((current - previous) / previous) * 100
    return inverted ? -change : change
  }
}

export const aiService = new FreeLLMService()
