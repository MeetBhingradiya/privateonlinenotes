'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/page-layout'
import toast from 'react-hot-toast'

export default function DebugFixIndexPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const runIndexFix = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/debug/fix-email-index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            const data = await response.json()
            
            if (response.ok) {
                toast.success('Email index fixed successfully!')
                setResult(data)
            } else {
                toast.error(data.message || 'Index fix failed')
                setResult(data)
            }
        } catch (error) {
            toast.error('Index fix failed')
            console.error('Index fix error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Fix Email Index</CardTitle>
                        <CardDescription>
                            This tool fixes the MongoDB email index to properly handle users without email addresses.
                            It drops the existing email index and creates a new sparse unique index.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                <strong>Info:</strong> This will recreate the email index to properly handle registration without email.
                                A sparse unique index allows multiple documents without the email field.
                            </p>
                        </div>
                        
                        <Button 
                            onClick={runIndexFix} 
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Fixing Index...' : 'Fix Email Index'}
                        </Button>

                        {result && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <h3 className="font-semibold mb-2">Fix Result:</h3>
                                <pre className="text-sm overflow-auto">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    )
}
