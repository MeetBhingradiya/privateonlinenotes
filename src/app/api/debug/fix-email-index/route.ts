import { NextRequest, NextResponse } from 'next/server'
import { initializeModels } from '@/models'

export async function POST(request: NextRequest) {
    try {
        const req = request as any // Type assertion to access collection methods
        console.log('Fixing email index...', req.method, req.url)
        const { User } = await initializeModels()

        // Get the MongoDB collection directly
        const collection = User.collection

        console.log('Checking existing indexes...')
        const indexes = await collection.indexes()
        console.log('Current indexes:', indexes)

        // Drop the existing email index if it exists
        try {
            await collection.dropIndex('email_1')
            console.log('Dropped existing email_1 index')
        } catch (error: any) {
            if (error.code !== 27) { // Index doesn't exist
                console.log('Error dropping index:', error.message)
            } else {
                console.log('Email index did not exist')
            }
        }

        // Create a new sparse unique index on email
        await collection.createIndex(
            { email: 1 },
            {
                unique: true,
                sparse: true,
                name: 'email_1_sparse'
            }
        )
        console.log('Created new sparse unique index on email')

        // Check final indexes
        const finalIndexes = await collection.indexes()
        console.log('Final indexes:', finalIndexes)

        return NextResponse.json({
            success: true,
            message: 'Email index fixed successfully',
            indexes: finalIndexes
        })

    } catch (error) {
        console.error('Fix email index error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fix email index',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
