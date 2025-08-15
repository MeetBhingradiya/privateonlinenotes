'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/page-layout'
import toast from 'react-hot-toast'

export default function DebugCleanupPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const runCleanup = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/debug/cleanup-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            const data = await response.json()
            
            if (response.ok) {
                toast.success('Database cleanup completed successfully!')
                setResult(data)
            } else {
                toast.error(data.message || 'Cleanup failed')
                setResult(data)
            }
        } catch (error) {
            toast.error('Cleanup failed')
            console.error('Cleanup error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Database Email Cleanup</CardTitle>
                        <CardDescription>
                            This tool fixes the email unique index issue by removing null email values from existing users.
                            This should be run once to fix the duplicate key error when creating accounts without email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                                <strong>Warning:</strong> This will modify your database. Make sure to backup your data first.
                                This cleanup removes null email values from users to fix the unique index constraint.
                            </p>
                        </div>
                        
                        <Button 
                            onClick={runCleanup} 
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Running Cleanup...' : 'Run Email Cleanup'}
                        </Button>

                        {result && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <h3 className="font-semibold mb-2">Cleanup Result:</h3>
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
