import mongoose from 'mongoose'

const FileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        enum: ['file', 'folder'],
        required: true,
    },
    language: {
        type: String,
        default: 'plaintext',
    },
    size: {
        type: Number,
        default: 0,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null,
    },
    path: {
        type: String,
        required: true,
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    shareCode: {
        type: String,
        unique: true,
        sparse: true,
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
    },
    expiresAt: {
        type: Date,
        sparse: true,
    },
    accessCount: {
        type: Number,
        default: 0,
    },
    reportCount: {
        type: Number,
        default: 0,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    permissions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        role: {
            type: String,
            enum: ['read', 'write', 'admin'],
            default: 'read',
        },
    }],
    versions: [{
        content: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    }],
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})

FileSchema.pre('save', function () {
    this.updatedAt = new Date()
    this.size = this.content ? Buffer.byteLength(this.content, 'utf8') : 0
})

FileSchema.index({ owner: 1, path: 1 }, { unique: true })
FileSchema.index({ 'permissions.user': 1 })

export const File = mongoose.models.File || mongoose.model('File', FileSchema)

export interface IFile {
    _id: string
    name: string
    type: 'file' | 'folder'
    content?: string
    language?: string
    size: number
    path: string
    owner?: string
    parentId?: string
    isPublic: boolean
    shareCode?: string
    slug?: string
    expiresAt?: Date
    accessCount: number
    reportCount: number
    isBlocked: boolean
    permissions: Array<{
        user: string
        role: 'read' | 'write' | 'admin'
        addedAt: Date
    }>
    tags: string[]
    createdAt: Date
    updatedAt: Date
}
