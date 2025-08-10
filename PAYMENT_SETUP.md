# Payment Setup Guide - Razorpay Test Integration

This guide will help you set up Razorpay test payments for the Notta.in application.

## Prerequisites

1. **Razorpay Account**: Sign up at [https://razorpay.com](https://razorpay.com)
2. **Test Mode**: Ensure you're using test mode for development

## Step 1: Get Razorpay Test Credentials

1. **Login to Razorpay Dashboard**
   - Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
   - Login to your account

2. **Switch to Test Mode**
   - In the dashboard, ensure the toggle at the top shows "Test Mode"
   - If not, click the toggle to switch to test mode

3. **Get API Keys**
   - Navigate to **Settings** → **API Keys**
   - Click **Generate Test Key** if you don't have one
   - Copy both:
     - **Key ID** (starts with `rzp_test_`)
     - **Key Secret** (keep this secure)

## Step 2: Configure Environment Variables

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Update your `.env.local` file** with your Razorpay credentials:
   ```bash
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/notta-in

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # App URL
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key

   # Razorpay Test Configuration
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id_here
   RAZORPAY_KEY_SECRET=your_actual_razorpay_secret_here

   # Environment
   NODE_ENV=development
   ```

## Step 3: Test Payment Flow

### Test Card Details

Use these test card numbers for different scenarios:

| Purpose | Card Number | CVV | Expiry | Expected Result |
|---------|-------------|-----|--------|-----------------|
| **Success** | `4111 1111 1111 1111` | Any 3 digits | Any future date | Payment Success |
| **Success** | `5555 5555 5555 4444` | Any 3 digits | Any future date | Payment Success |
| **Failure** | `4000 0000 0000 0002` | Any 3 digits | Any future date | Card Declined |
| **Insufficient Funds** | `4000 0000 0000 9995` | Any 3 digits | Any future date | Insufficient Funds |

### Test UPI IDs
- **Success**: `success@razorpay`
- **Failure**: `failure@razorpay`

### Test Bank Transfer
- Use any test bank account details provided in the Razorpay dashboard

## Step 4: Testing the Payment Integration

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Create a test account**:
   - Go to `http://localhost:3000/auth/register`
   - Create a new account

3. **Navigate to pricing**:
   - Go to `http://localhost:3000/pricing`
   - Try subscribing to the Premium or Enterprise plan

4. **Test payment scenarios**:
   - Use different test cards to simulate success/failure
   - Check the browser console for any errors
   - Verify payment records in your Razorpay dashboard

## Step 5: Webhook Setup (Optional but Recommended)

For production, set up webhooks to handle payment events:

1. **In Razorpay Dashboard**:
   - Go to **Settings** → **Webhooks**
   - Add webhook URL: `https://yourdomain.com/api/payments/webhook`
   - Select events: `payment.captured`, `payment.failed`

2. **Create webhook handler** (example):
   ```typescript
   // src/app/api/payments/webhook/route.ts
   import { NextRequest, NextResponse } from 'next/server'
   
   export async function POST(request: NextRequest) {
     // Handle Razorpay webhook events
     const body = await request.json()
     
     // Verify webhook signature
     // Update payment status in database
     
     return NextResponse.json({ status: 'ok' })
   }
   ```

## Step 6: Production Checklist

Before going live:

- [ ] Switch to Razorpay Live Mode
- [ ] Update environment variables with live credentials
- [ ] Test with real payment amounts (small amounts)
- [ ] Set up proper webhook endpoints
- [ ] Implement proper error handling
- [ ] Add payment confirmation emails
- [ ] Set up monitoring and alerts

## Troubleshooting

### Common Issues

1. **"Key ID is required" Error**
   - Check if `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly
   - Ensure the key starts with `rzp_test_`

2. **Payment popup doesn't appear**
   - Check browser console for JavaScript errors
   - Ensure Razorpay script is loading correctly
   - Check if popup blockers are disabled

3. **Payment verification fails**
   - In test mode, verification always succeeds
   - For production, implement proper signature verification

4. **Database connection issues**
   - Ensure MongoDB is running
   - Check the `MONGODB_URI` environment variable

### Debug Tips

1. **Enable debug logging**:
   ```typescript
   console.log('Order created:', order)
   console.log('Payment response:', response)
   ```

2. **Check Razorpay logs**:
   - Go to Razorpay Dashboard → Payments
   - Check individual payment details

3. **Monitor network requests**:
   - Use browser developer tools
   - Check API calls to `/api/payments/create-order` and `/api/payments/verify`

## Support

- **Razorpay Documentation**: [https://razorpay.com/docs](https://razorpay.com/docs)
- **Integration Guide**: [https://razorpay.com/docs/payments/payment-gateway/web-integration/](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- **Test Cards**: [https://razorpay.com/docs/payments/payments/test-card-upi-details/](https://razorpay.com/docs/payments/payments/test-card-upi-details/)

---

**Note**: This is a test setup. For production, ensure proper security measures, webhook verification, and error handling are implemented.
