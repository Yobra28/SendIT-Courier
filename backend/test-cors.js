const fetch = require('node-fetch');

async function testCORS() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing CORS configuration...');
  
  try {
    // Test the CORS endpoint
    const response = await fetch(`${baseUrl}/api/cors-test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://send-it-courier-abbi.vercel.app'
      }
    });
    
    console.log('✅ CORS test successful!');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.get('access-control-allow-origin'));
    
    const data = await response.json();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
  }
}

testCORS(); 