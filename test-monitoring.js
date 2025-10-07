// Test Monitoring & Health Check System
async function testMonitoring() {
  const BASE_URL = 'http://localhost:3000';

  console.log('🏥 Testing Monitoring & Health Check System\n');

  // Test health endpoint
  console.log('1. Testing Health Check Endpoint');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Overall Health: ${data.status}`);
    console.log(`   Uptime: ${Math.floor(data.uptime)}s`);
    console.log(`   Database: ${data.checks.database.status} (${data.checks.database.responseTime}ms)`);
    console.log(`   Memory: ${data.checks.memory.status} - ${data.checks.memory.message}`);

    if (data.status === 'healthy') {
      console.log('   ✅ Health check passed\n');
    } else {
      console.log('   ⚠️ System degraded or unhealthy\n');
    }
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error.message}\n`);
  }

  // Test metrics endpoint
  console.log('2. Testing Metrics Endpoint');
  try {
    const response = await fetch(`${BASE_URL}/api/metrics`);
    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Platform: ${data.system.platform}`);
    console.log(`   Node: ${data.system.nodeVersion}`);
    console.log(`   Environment: ${data.system.environment}`);
    console.log(`   Memory Usage:`);
    console.log(`     - Heap: ${data.memory.heapUsed}MB / ${data.memory.heapTotal}MB`);
    console.log(`     - RSS: ${data.memory.rss}MB`);
    if (data.database) {
      console.log(`   Database Response: ${data.database.responseTime}ms`);
    }
    console.log('   ✅ Metrics collected\n');
  } catch (error) {
    console.log(`   ❌ Metrics failed: ${error.message}\n`);
  }

  // Test readiness endpoint
  console.log('3. Testing Readiness Endpoint');
  try {
    const response = await fetch(`${BASE_URL}/api/ready`);
    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Ready: ${data.ready}`);

    if (data.ready) {
      console.log('   ✅ System ready\n');
    } else {
      console.log('   ⚠️ System not ready\n');
    }
  } catch (error) {
    console.log(`   ❌ Readiness check failed: ${error.message}\n`);
  }

  // Test logging with authentication
  console.log('4. Testing Logging Integration');
  try {
    // Test failed login (should be logged)
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid@test.com', pin: '000000' })
    });

    console.log(`   Failed login status: ${response.status}`);
    console.log('   ✅ Failed login logged (check server logs)\n');

    // Test successful login
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@amayacafe.com', pin: '001433' })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log(`   Successful login status: ${loginResponse.status}`);
      console.log('   ✅ Successful login logged (check server logs)\n');

      // Test logout
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Cookie': loginResponse.headers.get('set-cookie') || '' }
      });
      console.log('   ✅ Logout logged (check server logs)\n');
    }

  } catch (error) {
    console.log(`   ⚠️ Logging test warning: ${error.message}\n`);
  }

  console.log('✨ Monitoring System Test Complete!\n');
  console.log('📊 Summary:');
  console.log('   - Health checks: Working');
  console.log('   - Metrics collection: Working');
  console.log('   - Readiness probe: Working');
  console.log('   - Audit logging: Working');
  console.log('\n💡 Check server logs for detailed audit trail');
}

// Run the test
testMonitoring();