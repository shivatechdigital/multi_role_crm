import nodemailer from 'nodemailer'

type LeadActivityEmailPayload = {
  to: string
  appName: string
  leadName: string
  activities: Array<{
    type: string
    description: string
    createdAt: Date
    userName?: string | null
  }>
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

export function isLeadActivitiesEmailConfigured() {
  const { host, user, pass, from, port } = getSmtpConfig()
  return Boolean(host && user && pass && from && Number.isFinite(port))
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatActivityType(type: string) {
  return type.replace(/_/g, ' ')
}

export async function sendLeadActivitiesEmail(payload: LeadActivityEmailPayload) {
  const { host, port, user, pass, secure, from } = getSmtpConfig()
  if (!host || !user || !pass || !from || !Number.isFinite(port)) {
    throw new Error('SMTP configuration is incomplete')
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })

  const subject = `Activity update for ${payload.leadName} - ${payload.appName}`
  const activityLines = payload.activities.map((activity, index) => {
    const createdAtText = activity.createdAt.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    return [
      `${index + 1}. ${formatActivityType(activity.type)}`,
      `Added by: ${activity.userName || 'User'}`,
      `Added at: ${createdAtText}`,
      `Details: ${activity.description}`,
    ].join('\n')
  })

  const text = [
    `Hello,`,
    '',
    `Here is the latest activity timeline for ${payload.leadName}:`,
    '',
    ...activityLines,
  ].join('\n\n')

  const htmlRows = payload.activities
    .map((activity, index) => {
      const createdAtText = activity.createdAt.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })

      return `
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb; vertical-align: top;">${index + 1}</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; vertical-align: top;">${escapeHtml(formatActivityType(activity.type))}</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; vertical-align: top;">${escapeHtml(activity.description)}</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; vertical-align: top;">${escapeHtml(activity.userName || 'User')}</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; vertical-align: top;">${escapeHtml(createdAtText)}</td>
        </tr>
      `
    })
    .join('')

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin-bottom: 8px;">Activity timeline update</h2>
      <p style="margin-top: 0;">Here are the current activities added for <strong>${escapeHtml(payload.leadName)}</strong>.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 900px;">
        <thead>
          <tr>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">#</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Type</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Details</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Added By</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Added At</th>
          </tr>
        </thead>
        <tbody>${htmlRows}</tbody>
      </table>
    </div>
  `

  await transporter.sendMail({
    from,
    to: payload.to,
    subject,
    text,
    html,
  })
}
