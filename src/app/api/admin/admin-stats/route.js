import { NextResponse } from 'next/server';

export async function GET() {
    try {
        let stats;
        
        // Check if Firebase Admin credentials are available
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
            try {
                // Import Firebase Admin SDK dynamically
                const { adminDb } = await import('@/config/firebase-admin');
                
                // Get admin users from Firestore using Admin SDK
                const usersRef = adminDb.collection('users');
                const adminSnapshot = await usersRef.where('role', 'in', ['admin', 'super_admin']).get();
                
                const totalAdmins = adminSnapshot.size;
                
                // Count super admins and regular admins
                let superAdminCount = 0;
                let regularAdminCount = 0;
                const recentAdmins = [];
                
                adminSnapshot.forEach((doc) => {
                    const userData = doc.data();
                    if (userData.role === 'super_admin') {
                        superAdminCount++;
                    } else if (userData.role === 'admin') {
                        regularAdminCount++;
                    }
                    
                    // Add to recent admins (limit to 3)
                    if (recentAdmins.length < 3) {
                        recentAdmins.push({
                            id: doc.id,
                            email: userData.email,
                            role: userData.role,
                            createdAt: userData.createdAt?.toDate?.() || new Date()
                        });
                    }
                });

                stats = {
                    totalAdmins,
                    superAdminCount,
                    regularAdminCount,
                    recentAdmins
                };
                
                console.log('✅ Admin stats fetched from Firebase Admin SDK');
                
            } catch (firebaseError) {
                console.error('❌ Firebase Admin SDK error:', firebaseError);
                // Fallback to mock data
                stats = getMockAdminStats();
            }
        } else {
            // Use mock data when Firebase Admin credentials are not available
            stats = getMockAdminStats();
        }

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch admin statistics'
        }, { status: 500 });
    }
}

// Helper function to get mock admin stats
function getMockAdminStats() {
    return {
        totalAdmins: 2,
        superAdminCount: 1,
        regularAdminCount: 1,
        recentAdmins: [
            {
                id: 'super-admin-1',
                email: 'superadmin@example.com',
                role: 'super_admin',
                createdAt: new Date()
            },
            {
                id: 'admin-1',
                email: 'admin@example.com',
                role: 'admin',
                createdAt: new Date()
            }
        ]
    };
} 
