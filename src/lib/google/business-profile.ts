import { google } from 'googleapis'
import { auth } from '@/lib/auth/auth'

class BusinessProfileService {

  private async getClient() {
    const session = await auth()
    const accessToken = (session as any)?.accessToken

    if (!accessToken) {
      throw new Error('No access token available')
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    return oauth2Client
  }

  async listLocations() {
    const authClient = await this.getClient()

    const accountMgmt = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: authClient,
    })

    const accounts = await accountMgmt.accounts.list()
    const accountName = accounts.data.accounts?.[0]?.name

    if (!accountName) throw new Error('No GBP account found')

    const bizInfo = google.mybusinessbusinessinformation({
      version: 'v1',
      auth: authClient,
    })

    const locations = await bizInfo.accounts.locations.list({
      parent: accountName,
      readMask: 'name,title,websiteUri,phoneNumbers',
    })

    return locations.data.locations || []
  }

}

export const gbpService = new BusinessProfileService()
