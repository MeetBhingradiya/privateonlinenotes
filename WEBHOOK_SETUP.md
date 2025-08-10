# Local Webhook Setup Guide for Razorpay

This guide will help you set up Razorpay webhooks for local development using ngrok.

## Step 1: Install ngrok

### Windows (using Chocolatey):
```powershell
choco install ngrok
```

### Windows (manual):
1. Download ngrok from https://ngrok.com/download
2. Extract to a folder in your PATH
3. Sign up for a free ngrok account
4. Run: `ngrok authtoken YOUR_AUTHTOKEN`

### macOS:
```bash
brew install ngrok/ngrok/ngrok
```

## Step 2: Start Your Development Server

```bash
npm run dev
```

Your app should be running on `http://localhost:3000`

## Step 3: Expose Local Server with ngrok

In a new terminal, run:
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`) - this is your public webhook URL.

## Step 4: Configure Webhook in Razorpay Dashboard

1. **Login to Razorpay Dashboard**
   - Go to https://dashboard.razorpay.com
   - Switch to **Test Mode**

2. **Navigate to Webhooks**
   - Go to **Settings** → **Webhooks**
   - Click **+ Create Webhook**

3. **Configure Webhook**
   - **URL**: `https://your-ngrok-url.ngrok.io/api/payments/webhook`
   - **Alert Email**: Your email
   - **Secret**: Generate a random string (save this for .env)
   - **Events**: Select the following:
     - ✅ `payment.captured`
     - ✅ `payment.failed` 
     - ✅ `order.paid`

4. **Save the webhook**

## Step 5: Update Environment Variables

Add the webhook secret to your `.env.local`:

```bash
# Add this line with the secret you generated in Razorpay
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Step 6: Test the Webhook

1. **Make a test payment**:
   - Go to `http://localhost:3000/pricing`
   - Try to subscribe to a plan
   - Use test card: `4111 1111 1111 1111`

2. **Check logs**:
   - Watch your terminal where `npm run dev` is running
   - You should see webhook logs like:
     ```
     📨 Webhook received: { event: 'payment.captured', paymentId: '...', orderId: '...', status: 'captured' }
     💰 Payment captured: { id: 'pay_...', orderId: 'order_...', amount: 29900, status: 'captured' }
     ✅ User 64f... upgraded to premium plan
     ```

3. **Verify in Razorpay Dashboard**:
   - Go to **Payments** → **Transactions**
   - Check if your test payment appears
   - Go to **Settings** → **Webhooks**
   - Click on your webhook to see delivery logs

## Step 7: Test Different Scenarios

### Successful Payment:
- Card: `4111 1111 1111 1111`
- Expected: `payment.captured` webhook

### Failed Payment:
- Card: `4000 0000 0000 0002`
- Expected: `payment.failed` webhook

## Webhook Events Handled

Our webhook endpoint handles these events:

| Event | Description | Action |
|-------|-------------|--------|
| `payment.captured` | Payment successful | Update user plan in database |
| `payment.failed` | Payment failed | Log failure in payment history |
| `order.paid` | Order completed | Additional processing |

## Troubleshooting

### Webhook not receiving events:
1. Check if ngrok is still running
2. Verify the webhook URL in Razorpay dashboard
3. Check ngrok terminal for incoming requests
4. Ensure your dev server is running

### Signature verification fails:
1. Check if `RAZORPAY_WEBHOOK_SECRET` is set correctly
2. In development, signature verification is disabled
3. For production, uncomment signature verification code

### Database not updating:
1. Check MongoDB connection
2. Verify user ID in webhook payload
3. Check console logs for errors

## Production Deployment

For production:

1. **Remove ngrok** - use your actual domain
2. **Enable signature verification** in webhook handler
3. **Use HTTPS** - Razorpay requires HTTPS for webhooks
4. **Monitor webhook deliveries** in Razorpay dashboard
5. **Handle retries** - Razorpay retries failed webhooks

## Webhook Endpoint

The webhook is available at:
- **Local**: `https://your-ngrok-url.ngrok.io/api/payments/webhook`
- **Production**: `https://yourdomain.com/api/payments/webhook`

## Security Notes

- ✅ Webhook signature verification (enabled in production)
- ✅ Environment variables for secrets
- ✅ HTTPS required for production
- ✅ Proper error handling and logging

---

**Pro Tip**: Keep the ngrok terminal open while testing. If ngrok restarts, you'll get a new URL and need to update the webhook in Razorpay dashboard.
