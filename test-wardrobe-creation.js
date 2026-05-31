// Test script to diagnose wardrobe creation issue
// Run this in your browser console after logging in

async function testWardrobeCreation() {
  console.log('=== WARDROBE CREATION TEST ===');
  
  // Check if token exists
  const token = localStorage.getItem('token');
  console.log('1. Token exists:', !!token);
  if (token) {
    console.log('   Token preview:', token.substring(0, 30) + '...');
    
    // Try to decode the token (without verification)
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      console.log('   Token payload:', decoded);
      console.log('   Token expires:', new Date(decoded.exp * 1000));
      console.log('   Token expired:', Date.now() > decoded.exp * 1000);
    } catch (e) {
      console.error('   Failed to decode token:', e);
    }
  }
  
  // Check user data
  const user = localStorage.getItem('user');
  console.log('2. User data exists:', !!user);
  if (user) {
    console.log('   User:', JSON.parse(user));
  }
  
  // Test API call
  console.log('3. Testing wardrobe creation API call...');
  try {
    const response = await fetch('http://localhost:5001/api/wardrobe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'Test Wardrobe ' + Date.now() })
    });
    
    console.log('   Response status:', response.status);
    const data = await response.json();
    console.log('   Response data:', data);
    
    if (response.ok) {
      console.log('✅ SUCCESS: Wardrobe created!');
    } else {
      console.log('❌ FAILED: ', data.message);
    }
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
}

// Run the test
testWardrobeCreation();
