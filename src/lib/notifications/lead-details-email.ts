import nodemailer from 'nodemailer'

type LeadDetailsEmailPayload = {
  to: string
  appName: string
  lead: {
    id: string
    name: string
    email: string
    phone?: string | null
    company?: string | null
    service?: string | null
    budget?: string | null
    source?: string | null
    message?: string | null
    status: string
    score: number
    createdAt: Date
  }
}

function parseBoolean(value: string | undefined, fallback = false) {
  if (!value) return fallback
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim()
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  const secure = parseBoolean(process.env.SMTP_SECURE, port === 465)
  const from = process.env.SMTP_FROM?.trim()

  return { host, port, user, pass, secure, from }
}

export function isLeadDetailsEmailConfigured() {
  const { host, user, pass, from, port } = getSmtpConfig()
  return Boolean(host && user && pass && from && Number.isFinite(port))
}

function formatValue(value: string | null | undefined) {
  return value?.trim() || 'N/A'
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendLeadDetailsEmail(payload: LeadDetailsEmailPayload) {
  const { host, port, user, pass, secure, from } = getSmtpConfig()
  if (!host || !user || !pass || !from || !Number.isFinite(port)) {
    throw new Error('SMTP configuration is incomplete')
  }

  const lead = payload.lead
  const createdAtText = lead.createdAt.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })

  const subject = `Your lead details - ${payload.appName}`
  const textLines = [
    `Thank you for your inquiry. Here are your submitted lead details:`,
    '',
    `Lead ID: ${lead.id}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${formatValue(lead.phone)}`,
    `Company: ${formatValue(lead.company)}`,
    `Service Interested: ${formatValue(lead.service)}`,
    `Budget Range: ${formatValue(lead.budget)}`,
    `Lead Source: ${formatValue(lead.source)}`,
    `Message: ${formatValue(lead.message)}`,
    `Status: ${lead.status}`,
    `Score: ${lead.score}`,
    `Created At: ${createdAtText}`,
  ]

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin-bottom: 8px;">Lead details received</h2>
      <p style="margin-top: 0;">Thank you for your inquiry. Here are your submitted details.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 680px;">
        <tbody>
          <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>Lead ID</strong></td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${escapeHtml(lead.id)}</td></tr>
          <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>Name</strong></td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${escapeHtml(lead.name)}</td></tr>
          <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>Email</strong></td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${escapeHtml(lead.email)}</td></tr>
          <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>Phone</strong></td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${escapeHtml(formatValue(lead.phone))}</td></tr>
          <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>Company</strong></td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${escapeHtml(formatValue(lead.company))}</td></tr>
          <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>Service Interested</strong></td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${escapeHtml(formatValue(lead.service))}</td></tr>
          <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>Budget Range</strong></td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${escapeHtml(formatValue(lead.budget))}</td></tr>
          <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>Lead Source</strong></td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${escapeHtml(formatValue(lead.source))}</td></tr>
          <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>Message</strong></td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${escapeHtml(formatValue(lead.message))}</td></tr>
          <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>Status</strong></td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${escapeHtml(lead.status)}</td></tr>
          <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>Score</strong></td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${lead.score}</td></tr>
          <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb;"><strong>Created At</strong></td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${escapeHtml(createdAtText)}</td></tr>
        </tbody>
      </table>
    </div>
  `

  await transporter.sendMail({
    from,
    to: payload.to,
    subject,
    text: textLines.join('\n'),
    html,
  })
}
