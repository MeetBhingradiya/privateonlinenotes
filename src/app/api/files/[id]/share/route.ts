import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'
import { randomBytes } from 'crypto'
import { generateSlug, generateUniqueSlug } from '@/lib/utils'

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { File } = await initializeModels()
        const body = await request.json()
        const { customSlug, isPublic } = body

        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
        }

        const { id } = await context.params
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        const file = await File.findOne({
            _id: id,
            owner: decoded.userId,
        })

        if (!file) {
            return NextResponse.json({ message: 'File not found' }, { status: 404 })
        }

        // Generate share code and slug if they don't exist
        if (!file.shareCode || !file.slug) {
            if (!file.shareCode) {
                file.shareCode = randomBytes(16).toString('hex')
            }

            if (!file.slug) {
                let slugToUse = ''

                if (customSlug) {
                    // Validate custom slug
                    const cleanSlug = generateSlug(customSlug)
                    if (!cleanSlug) {
                        return NextResponse.json({ message: 'Invalid custom slug' }, { status: 400 })
                    }

                    // Check if custom slug already exists
                    const existingFile = await File.findOne({ slug: cleanSlug })
                    if (existingFile) {
                        return NextResponse.json({ message: 'Custom slug already exists' }, { status: 400 })
                    }

                    slugToUse = cleanSlug
                } else {
                    // Generate from file name
                    const baseSlug = generateSlug(file.name)
                    const existingFiles = await File.find({ slug: { $exists: true } }, 'slug')
                    const existingSlugs = existingFiles.map(f => f.slug)
                    slugToUse = generateUniqueSlug(baseSlug, existingSlugs)
                }

                file.slug = slugToUse
            }

            file.isPublic = isPublic !== undefined ? isPublic : true
            await file.save()
        } else {
            // Update public status if provided
            if (isPublic !== undefined) {
                file.isPublic = isPublic
                await file.save()
            }
        }

        return NextResponse.json({
            shareCode: file.shareCode,
            slug: file.slug
        })
    } catch (error) {
        console.error('File share error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
