#!/usr/bin/env node

// Test Webhook Script - Simulates Razorpay webhook calls locally
// Usage: node test-webhook.js [event-type]

const http = require('http');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000';
const WEBHOOK_SECRET = 'test-webhook-secret'; // Use your actual secret

// Sample webhook payloads
const webhookPayloads = {
    'payment.captured': {
        event: 'payment.captured',
        payload: {
            payment: {
                entity: {
                    id: 'pay_test_' + Date.now(),
                    order_id: 'order_test_' + Date.now(),
                    amount: 29900,
                    currency: 'INR',
                    status: 'captured',
                    method: 'card',
                    notes: {
                        userId: '507f1f77bcf86cd799439011',
                        userEmail: 'test@example.com',
                        planId: 'premium',
                        planName: 'Premium'
                    },
                    created_at: Math.floor(Date.now() / 1000)
                }
            }
        }
    },
    'payment.failed': {
        event: 'payment.failed',
        payload: {
            payment: {
                entity: {
                    id: 'pay_test_' + Date.now(),
                    order_id: 'order_test_' + Date.now(),
                    amount: 29900,
                    currency: 'INR',
                    status: 'failed',
                    method: 'card',
                    error_code: 'BAD_REQUEST_ERROR',
                    error_description: 'Your card was declined',
                    notes: {
                        userId: '507f1f77bcf86cd799439011',
                        userEmail: 'test@example.com',
                        planId: 'premium',
                        planName: 'Premium'
                    },
                    created_at: Math.floor(Date.now() / 1000)
                }
            }
        }
    },
    'order.paid': {
        event: 'order.paid',
        payload: {
            order: {
                entity: {
                    id: 'order_test_' + Date.now(),
                    amount: 29900,
                    currency: 'INR',
                    status: 'paid',
                    created_at: Math.floor(Date.now() / 1000)
                }
            }
        }
    }
};

function generateSignature(body, secret) {
    return crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
}

function sendWebhook(eventType) {
    const payload = webhookPayloads[eventType];

    if (!payload) {
        console.error('❌ Unknown event type:', eventType);
        console.log('Available events:', Object.keys(webhookPayloads).join(', '));
        process.exit(1);
    }

    const body = JSON.stringify(payload);
    const signature = generateSignature(body, WEBHOOK_SECRET);

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/payments/webhook',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            'x-razorpay-signature': signature
        }
    };

    console.log(`🚀 Sending ${eventType} webhook...`);
    console.log('📋 Payload:', JSON.stringify(payload, null, 2));

    const req = http.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
            responseBody += chunk;
        });

        res.on('end', () => {
            console.log(`📥 Response Status: ${res.statusCode}`);
            console.log(`📥 Response Body:`, responseBody);

            if (res.statusCode === 200) {
                console.log('✅ Webhook sent successfully!');
            } else {
                console.log('❌ Webhook failed!');
            }
        });
    });

    req.on('error', (err) => {
        console.error('❌ Request error:', err.message);
    });

    req.write(body);
    req.end();
}

// Get event type from command line arguments
const eventType = process.argv[2] || 'payment.captured';

console.log('🔧 Webhook Test Script');
console.log('📡 Target:', `${BASE_URL}/api/payments/webhook`);
console.log('🎯 Event:', eventType);
console.log('');

sendWebhook(eventType);
