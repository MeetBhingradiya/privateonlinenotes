# Quick Start: Local Payment Testing

## 🚀 Setup Summary

Your Razorpay webhook is now configured! Here's what you need to do:

### 1. **Environment Setup** ✅
- Webhook endpoint created: `/api/payments/webhook`
- Payment APIs updated with user tracking
- Test mode indicators added to pricing page

### 2. **Next Steps for Testing**

#### Option A: Full Webhook Testing (Recommended)
```bash
# 1. Install ngrok
npm install -g ngrok

# 2. Start your app
npm run dev

# 3. In another terminal, expose your local server
ngrok http 3000
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)

# 4. Configure in Razorpay Dashboard:
# - Go to https://dashboard.razorpay.com
# - Settings → Webhooks → Create Webhook
# - URL: https://your-ngrok-url.ngrok.io/api/payments/webhook
# - Events: payment.captured, payment.failed, order.paid
# - Generate a webhook secret and add to .env.local
```

#### Option B: Quick Local Testing
```bash
# Test webhook locally without ngrok
node test-webhook.js payment.captured
node test-webhook.js payment.failed
```

### 3. **Test Cards** 🧪
When testing payments at `/pricing`:

| Purpose | Card Number | Result |
|---------|------------|--------|
| **Success** | `4111 1111 1111 1111` | ✅ Payment Success |
| **Success** | `5555 5555 5555 4444` | ✅ Payment Success |
| **Failure** | `4000 0000 0000 0002` | ❌ Payment Declined |

### 4. **What Happens During Testing**

1. **Payment Flow**:
   - User clicks "Subscribe" on pricing page
   - Order created with user info
   - Razorpay popup opens
   - User enters test card details
   - Payment processed

2. **Webhook Flow**:
   - Razorpay sends webhook to your endpoint
   - User's plan gets updated in database
   - Payment history recorded
   - Console logs show the process

### 5. **Monitor the Process**

Watch your terminal for logs like:
```
💳 Order created: { orderId: 'order_123', amount: 29900, userId: '64f...', planId: 'premium' }
📨 Webhook received: { event: 'payment.captured', paymentId: 'pay_123', status: 'captured' }
✅ User 64f... upgraded to premium plan
```

### 6. **Verification**

After a successful test payment:
- Check user's plan in your database
- Verify payment history is recorded
- Confirm webhook delivery in Razorpay dashboard

### 7. **Files Created/Updated**

- ✅ `/api/payments/webhook` - Webhook handler
- ✅ `/api/payments/create-order` - Enhanced with user tracking
- ✅ `WEBHOOK_SETUP.md` - Detailed webhook setup guide
- ✅ `test-webhook.js` - Local webhook testing script
- ✅ `.env.example` - Updated with webhook secret
- ✅ Pricing page - Enhanced with test mode indicators

### 8. **Quick Test**

1. Start dev server: `npm run dev`
2. Go to: `http://localhost:3000/pricing`
3. Register/login as a test user
4. Click "Subscribe Now" on Premium plan
5. Use test card: `4111 1111 1111 1111`
6. Watch console for webhook logs

---

**Need Help?** 
- Check `WEBHOOK_SETUP.md` for detailed instructions
- Check `PAYMENT_SETUP.md` for Razorpay configuration
- Run `node test-webhook.js` to test webhook locally

**Ready to go live?**
- Switch to Razorpay Live mode
- Update environment variables
- Use your production domain for webhooks
