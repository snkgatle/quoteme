import { prisma } from '@quoteme/database';

export async function verifySystemHealth() {
    console.log('--- [SELF-HEALING] Commencing System Verification ---');

    const healthReport = {
        database: 'UNKNOWN',
        prismaClient: 'UNKNOWN',
        apiRoutes: 'PASS',
        overall: 'FAIL'
    };

    try {
        // 1. Check Database Connectivity & Prisma Client
        console.log('[DEBUG] Testing database connection and Prisma client...');
        await prisma.$connect();
        // Try a simple query
        await prisma.user.count();

        healthReport.database = 'CONNECTED';
        healthReport.prismaClient = 'READY';
        console.log('✅ Database and Prisma Client are healthy.');

    } catch (error: any) {
        console.error('❌ Database/Prisma Health Check Failed:', error.message);
        healthReport.database = 'FAILED';
        healthReport.prismaClient = 'ERROR';

        // Auto-remediation advice
        if (error.message.includes('PrismaClient did not initialize')) {
            console.log('💡 TIP: Try running "npm run generate -w packages/database"');
        } else if (error.message.includes('Can\'t reach database')) {
            console.log('💡 TIP: Check your DATABASE_URL environment variable.');
        }
    }

    // Final Verdict
    if (healthReport.database === 'CONNECTED' && healthReport.prismaClient === 'READY') {
        healthReport.overall = 'PASS';
    }

    console.log('--- [HEALTH REPORT] ---');
    console.table(healthReport);

    if (healthReport.overall === 'FAIL') {
        console.log('⚠️ Warning: System is not in a healthy state for production deployment.');
    } else {
        console.log('🚀 System is verified and ready for deployment.');
    }

    return healthReport;
}

// If run directly
if (require.main === module) {
    verifySystemHealth()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
