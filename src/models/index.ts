import dbConnect from '@/lib/mongodb'

// Initialize models function to ensure they're registered
export async function initializeModels() {
    await dbConnect()

    // Import models to ensure they're registered
    const { User } = await import('./User')
    const { File } = await import('./File')

    return { User, File }
}

// Re-export models and types
export { User } from './User'
export { File } from './File'
export type { IUser } from './User'
export type { IFile } from './File'
