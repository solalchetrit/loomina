# Loomina Identity Verify - Diagnostic Plan

## Current Setup Analysis

### Frontend Flow (DashboardPage)
1. User enters phone number
2. Clicks "Recevoir mon code"
3. `handleRequestOtp` is triggered:
   - Checks if user exists via RPC `check_client_exists`
   - Formats phone to E.164
   - Calls `/api/auth/verify` with `action: "start"` and `phone_number`
   - Moves to OTP step

### API Route (/api/auth/verify)
- Receives request from frontend
- Forwards to Make.com webhook: `https://hook.eu1.make.com/t1io85fnb9im0f3isnnf47iyn0n3s0ms`
- Expects JSON response from Make

### Expected Make.com Scenario (ID: 47193eea-8749-4773-a2d2-cdb6ee1e8870)
- Should be triggered by webhook
- Should use Twilio Verify to send OTP
- Should return success/failure response

## Potential Issues

### 1. Webhook URL Mismatch
- **Current webhook in code**: `https://hook.eu1.make.com/t1io85fnb9im0f3isnnf47iyn0n3s0ms`
- **Scenario ID**: `47193eea-8749-4773-a2d2-cdb6ee1e8870`
- Need to verify this webhook belongs to the correct scenario

### 2. Scenario Not Active
- Scenario might be paused/disabled in Make.com

### 3. Webhook Module Configuration
- Webhook might not be configured to accept the payload structure
- Expected: `{ action: "start", phone_number: "+33..." }`

### 4. Twilio Verify Configuration
- Service SID might be missing/incorrect
- API credentials might be invalid

### 5. Response Format
- Make.com might not be returning expected JSON format
- Frontend expects specific response structure for "check" action

## Diagnostic Steps

1. **Test webhook directly** with curl to see if it triggers
2. **Check Make.com scenario**:
   - Is it active?
   - What's the webhook URL?
   - What's the expected payload?
3. **Check Twilio configuration** in Make.com
4. **Add detailed logging** to track the flow
5. **Test with real phone number**

## Fix Strategy

1. Get Make.com API token to inspect scenario
2. Verify webhook URL matches scenario
3. Ensure scenario is active
4. Test Twilio Verify configuration
5. Add proper error handling and logging
6. Update response format if needed
