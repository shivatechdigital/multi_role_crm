import nodemailer from 'nodemailer'

type InviteEmailPayload = {
  to: string
  inviteUrl: string
  role: string
  inviterName?: string | null
  inviterEmail?: string | null
  expiresAt: Date
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

export function isInviteEmailConfigured() {
  const { host, user, pass, from, port } = getSmtpConfig()
  return Boolean(host && user && pass && from && Number.isFinite(port))
}

export async function sendTeamInviteEmail(payload: InviteEmailPayload) {
  const { host, port, user, pass, secure, from } = getSmtpConfig()
  if (!host || !user || !pass || !from || !Number.isFinite(port)) {
    throw new Error('SMTP configuration is incomplete')
  }

  const appName = process.env.APP_NAME?.trim() || 'Multi-Role CRM'
  const inviterIdentity = payload.inviterName || payload.inviterEmail || 'an admin'
  const expiresText = payload.expiresAt.toLocaleString('en-US', {
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

  const subject = `You're invited to join ${appName}`
  const text = [
    `You have been invited to join ${appName}.`,
    `Role: ${payload.role}`,
    `Invited by: ${inviterIdentity}`,
    `Invite link: ${payload.inviteUrl}`,
    `Expires at: ${expiresText}`,
  ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin-bottom: 8px;">You are invited to join ${appName}</h2>
      <p style="margin-top: 0;">${inviterIdentity} invited you to the workspace.</p>
      <p><strong>Role:</strong> ${payload.role}</p>
      <p><strong>Expires:</strong> ${expiresText}</p>
      <p>
        <a href="${payload.inviteUrl}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 8px;">
          Accept Invitation
        </a>
      </p>
      <p>If the button does not work, copy and paste this URL in your browser:</p>
      <p><a href="${payload.inviteUrl}">${payload.inviteUrl}</a></p>
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