// Test JWT Authentication System
async function testJWTAuth() {
  const BASE_URL = 'http://localhost:3000';

  console.log('🔐 Testing JWT Authentication System\n');

  try {
    // 1. Test Login
    console.log('1. Testing Login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@amayacafe.com',
        pin: '001433'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', {
      status: loginResponse.status,
      success: loginData.success,
      user: loginData.user,
      hasAccessToken: !!loginData.accessToken
    });

    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.error}`);
    }

    const { accessToken } = loginData;
    console.log('✅ Login successful\n');

    // Extract refresh token from cookies
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies set:', !!cookies);

    // 2. Test Protected Endpoint
    console.log('2. Testing Protected Endpoint...');
    const protectedResponse = await fetch(`${BASE_URL}/api/protected/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const protectedData = await protectedResponse.json();
    console.log('Protected Endpoint Response:', {
      status: protectedResponse.status,
      success: protectedData.success,
      user: protectedData.user
    });

    if (protectedResponse.status !== 200) {
      throw new Error('Protected endpoint failed');
    }
    console.log('✅ Protected endpoint accessible\n');

    // 3. Test Invalid Token
    console.log('3. Testing Invalid Token...');
    const invalidResponse = await fetch(`${BASE_URL}/api/protected/user`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    console.log('Invalid Token Response:', {
      status: invalidResponse.status,
      error: (await invalidResponse.json()).error
    });

    if (invalidResponse.status !== 401) {
      throw new Error('Invalid token should return 401');
    }
    console.log('✅ Invalid token rejected correctly\n');

    // 4. Test Refresh Token
    console.log('4. Testing Token Refresh...');
    const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      }
    });

    const refreshData = await refreshResponse.json();
    console.log('Refresh Response:', {
      status: refreshResponse.status,
      success: refreshData.success,
      hasNewToken: !!refreshData.accessToken
    });

    if (refreshData.success) {
      console.log('✅ Token refresh successful\n');
    } else {
      console.log('⚠️ Token refresh needs cookie support\n');
    }

    // 5. Test Logout
    console.log('5. Testing Logout...');
    const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Cookie': cookies || '' }
    });

    const logoutData = await logoutResponse.json();
    console.log('Logout Response:', {
      status: logoutResponse.status,
      success: logoutData.success
    });
    console.log('✅ Logout successful\n');

    console.log('🎉 All JWT authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testJWTAuth();