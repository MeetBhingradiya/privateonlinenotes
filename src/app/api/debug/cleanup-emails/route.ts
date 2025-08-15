import { NextResponse } from 'next/server'
import { initializeModels } from '@/models'

// This is a one-time cleanup script to fix the email index issue
// It should be called once to clean up any existing null email values
export async function POST() {
    try {
        const { User } = await initializeModels()

        // Find all users with null or empty email and remove the email field completely
        const result = await User.updateMany(
            { 
                $or: [
                    { email: null },
                    { email: "" },
                    { email: { $exists: true, $in: [null, ""] } }
                ]
            },
            { 
                $unset: { email: "" } 
            }
        )

        console.log('Database cleanup completed:', result)

        return NextResponse.json({ 
            message: 'Database cleanup completed successfully',
            modifiedCount: result.modifiedCount
        })

    } catch (error) {
        console.error('Database cleanup error:', error)
        return NextResponse.json(
            { 
                message: 'Database cleanup failed', 
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
