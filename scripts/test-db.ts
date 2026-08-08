import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing database connection...\n')
  
  try {
    await prisma.$connect()
    console.log('✅ Database connected!\n')
    
    const setting = await prisma.setting.upsert({
      where: { key: 'test_connection' },
      update: { value: { tested: true, timestamp: new Date().toISOString() } },
      create: {
        key: 'test_connection',
        value: { tested: true, timestamp: new Date().toISOString() }
      }
    })
    console.log('✅ Write test passed:', setting.key)
    
    const count = await prisma.setting.count()
    console.log('✅ Read test passed. Total settings:', count)
    
    const tables = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('✅ Total tables:', tables[0].count.toString())
    
    console.log('\n🎉 All tests passed! Database is ready.')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
