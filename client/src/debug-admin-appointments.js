// Debug script to test admin appointments endpoint
// Run this in browser console on http://localhost:3000/admin/appointments

console.log('=== Admin Appointments Debug ===');

// Check localStorage
const userString = localStorage.getItem('user');
console.log('1. User in localStorage:', userString);

if (userString && userString !== 'undefined') {
  try {
    const user = JSON.parse(userString);
    console.log('2. Parsed user:', user);
    console.log('3. User role:', user.role);
    console.log('4. Has token:', !!user.token);
    
    if (user.role !== 'admin') {
      console.error('❌ ERROR: User role is not "admin". Current role:', user.role);
      console.log('You need to login as an admin user to access this page.');
    }
    
    // Test the API call
    if (user.token) {
      console.log('5. Testing API call...');
      fetch('http://localhost:5000/api/admin/appointments', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        console.log('6. Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('7. Response data:', data);
        if (data.success) {
          console.log('✅ SUCCESS: Appointments fetched:', data.count);
        } else {
          console.error('❌ ERROR:', data.msg);
        }
      })
      .catch(err => {
        console.error('❌ Network error:', err);
      });
    }
  } catch (e) {
    console.error('❌ Failed to parse user:', e);
  }
} else {
  console.error('❌ No user found in localStorage. Please login first.');
}
