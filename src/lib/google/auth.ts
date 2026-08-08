import { google } from 'googleapis'
import path from 'path'

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
]

export function getGoogleAuth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
    scopes: SCOPES,
  })
  
  return auth
}

export async function getAuthClient() {
  const auth = getGoogleAuth()
  return await auth.getClient()
}
