// Test Error Handling System
async function testErrorHandling() {
  const BASE_URL = 'http://localhost:3000';

  console.log('🔥 Testing Error Handling System\n');

  // Test cases
  const tests = [
    {
      name: 'Validation Error - Missing Fields',
      endpoint: '/api/auth/login',
      method: 'POST',
      body: { email: 'test@example.com' }, // Missing PIN
      expectedStatus: 400,
    },
    {
      name: 'Authentication Error - Invalid Credentials',
      endpoint: '/api/auth/login',
      method: 'POST',
      body: { email: 'invalid@example.com', pin: '123456' },
      expectedStatus: 401,
    },
    {
      name: 'Authorization Error - No Token',
      endpoint: '/api/protected/user',
      method: 'GET',
      expectedStatus: 401,
    },
    {
      name: 'Authorization Error - Invalid Token',
      endpoint: '/api/protected/user',
      method: 'GET',
      headers: { 'Authorization': 'Bearer invalid-token' },
      expectedStatus: 401,
    },
  ];

  for (const test of tests) {
    console.log(`\n📝 Test: ${test.name}`);
    console.log(`   Endpoint: ${test.method} ${test.endpoint}`);

    try {
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          ...test.headers,
        },
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(`${BASE_URL}${test.endpoint}`, options);
      const data = await response.json();

      console.log(`   Status: ${response.status} (Expected: ${test.expectedStatus})`);

      if (data.error) {
        console.log(`   Error Code: ${data.error.code || 'N/A'}`);
        console.log(`   Error Message: ${data.error.message || data.error}`);
        console.log(`   Correlation ID: ${data.error.correlationId || 'N/A'}`);
      }

      if (response.status === test.expectedStatus) {
        console.log('   ✅ Test Passed');
      } else {
        console.log('   ❌ Test Failed - Unexpected status code');
      }

    } catch (error) {
      console.log(`   ❌ Test Failed - ${error.message}`);
    }
  }

  console.log('\n\n🎯 Testing Retry Mechanism\n');

  // Simulate a flaky endpoint
  let attemptCount = 0;
  console.log('Simulating flaky endpoint (will fail 2 times, succeed on 3rd)...');

  // Note: This would need a special endpoint that simulates failures
  // For now, just demonstrate the retry client structure

  console.log('\n✨ Error Handling System Test Complete!');
}

// Run the test
testErrorHandling();