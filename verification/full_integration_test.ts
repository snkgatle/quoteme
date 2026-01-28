
const API_URL = 'http://localhost:3300/api';
const TEST_SP_EMAIL = 'integration-test-sp-' + Date.now() + '@example.com';
const TEST_SP_PASSWORD = 'password123';
const TEST_USER_EMAIL = 'integration-test-user-' + Date.now() + '@example.com';

async function runTest() {
    console.log('🚀 Starting Full-Stack Integration Test');

    // 1. Register/Login Service Provider
    console.log('\n--- Step 1: Register Service Provider ---');
    const authRes = await fetch(`${API_URL}/auth/sp/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: TEST_SP_EMAIL,
            password: TEST_SP_PASSWORD,
            latitude: -26.2041,
            longitude: 28.0473
        })
    });

    const authText = await authRes.text();
    let authData: any;
    try {
        authData = JSON.parse(authText);
    } catch (e) {
        throw new Error(`SP Auth failed: Received non-JSON response from ${API_URL}/auth/sp/login. Status: ${authRes.status}. Body: ${authText.substring(0, 200)}`);
    }

    if (!authRes.ok) throw new Error('SP Auth failed: ' + JSON.stringify(authData));
    const spToken = authData.token;
    const spId = authData.user.id;
    console.log('✅ SP Registered:', TEST_SP_EMAIL);

    // 2. Complete SP Onboarding (Set trades and status)
    console.log('\n--- Step 2: Complete SP Onboarding ---');
    const profileRes = await fetch(`${API_URL}/sp/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${spToken}`
        },
        body: JSON.stringify({
            businessName: 'Integrated Testing Co.',
            bio: 'Test bio for integration testing',
            services: ['Carpenter'], // Matching trade
            latitude: -26.2041,
            longitude: 28.0473
        })
    });
    if (!profileRes.ok) throw new Error('Profile update failed: ' + await profileRes.text());
    console.log('✅ SP Profile Updated (Status: ACTIVE, Trade: Carpentry)');

    // 3. Create a User Project
    console.log('\n--- Step 3: Create User Project ---');
    const projectRes = await fetch(`${API_URL}/submit-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userEmail: TEST_USER_EMAIL,
            userName: 'Test User',
            userPhone: '0123456789',
            latitude: -26.2041,
            longitude: 28.0473,
            description: 'I need a custom wooden bookshelf. It should be made of oak. #Carpentry'
        })
    });
    const projectData: any = await projectRes.json();
    if (!projectRes.ok) throw new Error('Project creation failed: ' + JSON.stringify(projectData));
    const projectId = projectData.projectId;
    console.log('✅ Project Created:', projectId);
    console.log('   Extracted Trades:', projectData.extractedTrades);

    // 4. Verify Project appears in SP Inbox
    console.log('\n--- Step 4: Verify Project in SP Inbox ---');

    // Debug: Check SP Profile
    const meRes = await fetch(`${API_URL}/auth/sp/me`, {
        headers: { 'Authorization': `Bearer ${spToken}` }
    });
    const meData: any = await meRes.json();
    console.log('   SP Profile:', {
        id: meData.id,
        status: meData.status,
        trades: meData.trades,
        lat: meData.latitude,
        lon: meData.longitude
    });

    const inboxRes = await fetch(`${API_URL}/sp/available-projects`, {
        headers: { 'Authorization': `Bearer ${spToken}` }
    });
    const inboxData: any = await inboxRes.json();

    // Debug: Check projects in list
    console.log('   Projects in Inbox:', inboxData.newRequests.length);
    if (inboxData.newRequests.length > 0) {
        console.log('   First project trades:', inboxData.newRequests[0].requiredTrades);
    }

    const foundProject = inboxData.newRequests.find((p: any) => p.id === projectId);
    if (!foundProject) {
        console.error('Available Projects:', JSON.stringify(inboxData, null, 2));
        throw new Error('Project not found in SP inbox. Matching might have failed.');
    }
    console.log('✅ Project found in SP inbox');

    // 5. Submit a Quote
    console.log('\n--- Step 5: Submit SP Quote ---');
    const quoteRes = await fetch(`${API_URL}/sp/quotes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${spToken}`
        },
        body: JSON.stringify({
            requestId: projectId,
            amount: 1500,
            proposal: 'I can build this oak bookshelf in 3 days.',
            trade: 'Carpenter'
        })
    });
    if (!quoteRes.ok) throw new Error('Quote submission failed: ' + await quoteRes.text());
    console.log('✅ Quote Submitted');

    // 6. Verify Quote in User View
    console.log('\n--- Step 6: Verify Quote in User View ---');
    const userProjectRes = await fetch(`${API_URL}/projects/${projectId}`);
    const userProjectData: any = await userProjectRes.json();
    const hasQuote = userProjectData.quotes.some((q: any) => q.serviceProviderId === spId);
    if (!hasQuote) {
        throw new Error('Quote not found in project view for user');
    }
    console.log('✅ Quote visible in "Combined Quote" view');

    // 7. Verify Quote Status in SP Dashboard
    console.log('\n--- Step 7: Verify SP Dashboard Status ---');
    const spDashRes = await fetch(`${API_URL}/sp/available-projects`, {
        headers: { 'Authorization': `Bearer ${spToken}` }
    });
    const spDashData: any = await spDashRes.json();
    const sentQuote = spDashData.sentQuotes.find((q: any) => q.requestId === projectId);
    if (!sentQuote) {
        throw new Error('Quote not found in SP sent quotes');
    }
    console.log('✅ Quote Status in SP Dashboard:', sentQuote.statusBadge);

    console.log('\n✨ ALL INTEGRATION TESTS PASSED! ✨');
}

runTest().catch(err => {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
});
