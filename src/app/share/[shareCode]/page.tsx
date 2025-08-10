import { notFound } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import { File } from '@/models/File'
import { ShareViewer } from '@/components/share-viewer'

interface SharePageProps {
  params: Promise<{
    shareCode: string
  }>
}

async function getSharedFile(shareCode: string) {
  await dbConnect()
  
  const file = await File.findOne({ 
    shareCode, 
    isPublic: true,
    isBlocked: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
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
