// Test script for admin management system
// Run with: node scripts/test-admin-management.js

const BASE_URL = 'http://localhost:3000';

async function testAdminManagement() {
  console.log('🧪 Testing Admin Management System...\n');

  // Test 1: List users
  console.log('1. Testing user listing...');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/users/list`);
    const data = await response.json();
    console.log('✅ List users:', data.success ? 'SUCCESS' : 'FAILED');
    if (data.users) {
      console.log(`   Found ${data.users.length} users`);
    }
  } catch (error) {
    console.log('❌ List users failed:', error.message);
  }

  // Test 2: Create admin user
  console.log('\n2. Testing admin user creation...');
  try {
    const createData = {
      email: 'test-admin@example.com',
      password: 'testpassword123',
      role: 'admin',
      permissions: ['view_dashboard', 'manage_content'],
      createdBy: 'super_admin'
    };

    const response = await fetch(`${BASE_URL}/api/admin/users/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createData),
    });

    const data = await response.json();
    console.log('✅ Create admin:', data.success ? 'SUCCESS' : 'FAILED');
    if (data.success) {
      console.log(`   Created user: ${data.user.email}`);
    } else {
      console.log(`   Error: ${data.error}`);
    }
  } catch (error) {
    console.log('❌ Create admin failed:', error.message);
  }

  // Test 3: Update admin user
  console.log('\n3. Testing admin user update...');
  try {
    // First, get a list of users to find an admin to update
    const listResponse = await fetch(`${BASE_URL}/api/admin/users/list?role=admin`);
    const listData = await listResponse.json();
    
    if (listData.users && listData.users.length > 0) {
      const adminToUpdate = listData.users[0];
      
      const updateData = {
        uid: adminToUpdate.uid,
        role: 'super_admin',
        updatedBy: 'super_admin'
      };

      const response = await fetch(`${BASE_URL}/api/admin/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      console.log('✅ Update admin:', data.success ? 'SUCCESS' : 'FAILED');
      if (data.success) {
        console.log(`   Updated user role to: ${data.user.role}`);
      } else {
        console.log(`   Error: ${data.error}`);
      }
    } else {
      console.log('⚠️ No admin users found to update');
    }
  } catch (error) {
    console.log('❌ Update admin failed:', error.message);
  }

  console.log('\n🏁 Admin management tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAdminManagement().catch(console.error);
}

module.exports = { testAdminManagement }; 