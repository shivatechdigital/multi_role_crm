// prisma/seeds/platforms.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const platforms = [
  {
    platform: 'linkedin',
    isEnabled: true,
    postDelay: 60, // 1 min
  },
  {
    platform: 'medium',
    isEnabled: true,
    postDelay: 300, // 5 min
  },
  {
    platform: 'devto',
    isEnabled: true,
    postDelay: 600, // 10 min
  },
  {
    platform: 'hashnode',
    isEnabled: true,
    postDelay: 900, // 15 min
  },
  {
    platform: 'facebook',
    isEnabled: true,
    postDelay: 120, // 2 min
  },
  {
    platform: 'instagram',
    isEnabled: true,
    postDelay: 180, // 3 min
  },
  {
    platform: 'twitter',
    isEnabled: true,
    postDelay: 60, // 1 min
  },
  {
    platform: 'gbp',
    isEnabled: true,
    postDelay: 240, // 4 min
  },
]

async function main() {
  console.log('🌱 Seeding platform configs...')
  
  for (const platform of platforms) {
    await prisma.platformConfig.upsert({
      where: { platform: platform.platform },
      update: {},
      create: platform,
    })
    console.log(`✅ ${platform.platform}`)
  }
  
  console.log('✨ Done!')
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())
