import { notFound } from 'next/navigation'
import { initializeModels } from '@/models'
import { ShareViewer } from '@/components/share-viewer'
import { SharedFolderViewer } from '@/components/shared-folder-viewer'

interface SharePageProps {
    params: Promise<{
        shareCode: string
    }>
}

async function getSharedFile(identifier: string) {
    const { File } = await initializeModels()

    // Try to find by slug first, then by shareCode
    const file = await File.findOne({
        $and: [
            {
                $or: [
                    { slug: identifier },
                    { shareCode: identifier }
                ]
            },
            { isPublic: true },
            { isBlocked: false },
            {
                $or: [
                    { expiresAt: { $exists: false } },
                    { expiresAt: null },
                    { expiresAt: { $gt: new Date() } }
                ]
            }
        ]
    }).populate('owner', 'name email')

    if (!file) {
        return null
    }

    // Increment access count
    await File.findByIdAndUpdate(file._id, { $inc: { accessCount: 1 } })

    return {
        _id: file._id.toString(),
        name: file.name,
        type: file.type,
        content: file.content,
        language: file.language,
        size: file.size,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
        owner: file.owner ? {
            name: file.owner.name,
            email: file.owner.email,
        } : null,
    }
}

export default async function SharePage({ params }: SharePageProps) {
    const { shareCode } = await params
    const file = await getSharedFile(shareCode)

    if (!file || !file.owner) {
        notFound()
    }

    if (file.type === 'folder') {
        return <SharedFolderViewer folder={file as any} />
    }

    return <ShareViewer file={file as any} />
}

export async function generateMetadata({ params }: SharePageProps) {
    const { shareCode } = await params
    const file = await getSharedFile(shareCode)

    if (!file || !file.owner) {
        return {
            title: 'File not found - Notta.in',
        }
    }

    return {
        title: `${file.name} - Shared on Notta.in`,
        description: `File shared by ${file.owner.name} on Notta.in`,
    }
}
