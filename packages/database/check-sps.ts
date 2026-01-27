import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const sps = await prisma.serviceProvider.findMany({
        take: 5,
        select: {
            email: true,
            trades: true,
            status: true
        }
    })
    sps.forEach(sp => console.log(`${sp.email} | ${sp.status} | ${sp.trades.join(',')}`))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
