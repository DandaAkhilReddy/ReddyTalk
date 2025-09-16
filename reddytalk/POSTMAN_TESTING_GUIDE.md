# ReddyTalk API Testing Guide - ElevenLabs & Twilio

## Setup Instructions

### 1. Import Postman Collection
1. Open Postman
2. Click "Import" button
3. Select `ReddyTalk-Complete-API-Collection.json`
4. Collection will appear in your workspace

### 2. Configure Environment Variables
Create a new Postman environment with these variables:

```
baseUrl: http://localhost:8081
authToken: (will be set automatically after login)
elevenLabsApiKey: your_actual_elevenlabs_api_key
elevenLabsVoiceId: EXAVITQu4vr4xnSDxMaL
twilioAccountSid: your_twilio_account_sid
twilioAuthToken: your_twilio_auth_token
twilioPhoneNumber: your_twilio_phone_number
```

### 3. Get API Keys

#### ElevenLabs API Key:
1. Go to https://elevenlabs.io
2. Sign up/Login
3. Go to Profile Settings → API Keys
4. Generate new API key
5. Copy and add to Postman environment

#### Twilio Credentials:
1. Go to https://www.twilio.com/console
2. Sign up/Login
3. Find Account SID and Auth Token on dashboard
4. Buy a phone number from Phone Numbers section
5. Copy all credentials to Postman environment

### 4. Start the Backend Server

```bash
cd reddytalk
npm install
node backend-api-complete.js
```

Server should start on port 8081.

## Testing Workflow

### Step 1: Health Check
Run: **1. Health & Status Checks → Basic Health Check**
- Expected: 200 OK with health status

### Step 2: Authentication
1. Run: **2. Authentication → Login**
   - Uses default credentials: admin@reddytalk.ai / admin123
   - Token will be saved automatically
2. Run: **2. Authentication → Verify Token**
   - Should return user information

### Step 3: Test ElevenLabs Integration

#### A. Test Voice Agent Endpoints (Local):
1. **Schedule Appointment via Voice**
   - Simulates ElevenLabs agent scheduling appointment
   - Check response for confirmation number

2. **Check Appointment Availability**
   - Query available time slots
   - Returns doctor availability

3. **Patient Lookup**
   - Search for existing patients
   - Returns patient records

4. **Verify Insurance**
   - Validates insurance coverage
   - Returns copay and deductible info

5. **Get Clinic Information**
   - Returns doctors, services, hours

#### B. Test ElevenLabs Direct API:
1. **Text to Speech**
   - Requires valid ElevenLabs API key
   - Returns audio stream
   - Save response as .mp3 file to listen

2. **Get Available Voices**
   - Lists all available voices
   - Find voice IDs for testing

### Step 4: Test Twilio Integration

#### A. Webhook Simulation (No real call):
1. **Incoming Call Webhook**
   - Simulates incoming call
   - Returns TwiML response

2. **Voice Conversation Flow**
   - Simulates voice input processing
   - Returns AI response in TwiML

3. **Call Status Callback**
   - Updates call completion status

#### B. Real Call Testing (Requires Twilio account):
1. **Make Outbound Call**
   - Actually places a call
   - Requires valid Twilio credentials
   - Test with your own phone number

### Step 5: Test Voice Pipeline
1. **Start Voice Session**
   - Initialize conversation session

2. **Process Voice Input**
   - Send audio for transcription

3. **Generate Voice Response**
   - Convert text to speech

### Step 6: Patient & Appointment Management
1. **Get All Patients**
2. **Create Patient**
3. **Get All Appointments**
4. **Create Appointment**

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution:** Run login endpoint first to get auth token

### Issue: ElevenLabs endpoints return 401
**Solution:** Check webhook token in .env file matches request header

### Issue: Twilio webhooks not working
**Solution:**
1. Check Twilio credentials in environment
2. Ensure ngrok is running if testing locally
3. Update webhook URLs in Twilio console

### Issue: Port 8081 already in use
**Solution:**
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Or change port in backend-api-complete.js
```

## Testing Checklist

- [ ] Backend server running on port 8081
- [ ] Health check returns 200 OK
- [ ] Authentication successful
- [ ] ElevenLabs webhook token configured
- [ ] ElevenLabs API key valid (if testing direct API)
- [ ] Twilio credentials configured (if testing real calls)
- [ ] Can schedule appointment via API
- [ ] Can check availability
- [ ] Can verify insurance
- [ ] Voice webhook simulation works
- [ ] Patient CRUD operations work
- [ ] Appointment CRUD operations work

## Advanced Testing

### Load Testing
Use Postman's Collection Runner:
1. Select collection
2. Click "Run" button
3. Set iterations (e.g., 100)
4. Set delay between requests
5. Run and check performance

### Webhook Testing with ngrok
For real Twilio/ElevenLabs webhooks:
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 8081

# Use ngrok URL in Twilio/ElevenLabs console
# Example: https://abc123.ngrok.io/api/twilio/voice
```

### Environment-Specific Testing
Create multiple environments in Postman:
- Development (localhost)
- Staging (staging URL)
- Production (production URL)

Switch environments to test different deployments.

## API Response Examples

### Successful Appointment Scheduling:
```json
{
  "success": true,
  "appointment_id": "apt_1710432000000",
  "confirmation_number": "RDYABC123",
  "scheduled_date": "2024-03-15",
  "scheduled_time": "14:30",
  "doctor_name": "Dr. Sarah Wilson",
  "message": "Appointment confirmed for John Smith on 2024-03-15 at 14:30"
}
```

### Availability Check Response:
```json
{
  "success": true,
  "date": "2024-03-15",
  "available_slots": [
    {
      "time": "09:00",
      "doctor": "Dr. Sarah Wilson",
      "specialty": "General",
      "duration": 30,
      "available": true
    }
  ],
  "total_slots": 18,
  "next_available": "09:00"
}
```

### Insurance Verification Response:
```json
{
  "success": true,
  "insurance_accepted": true,
  "provider": "Blue Cross Blue Shield",
  "verification": {
    "verified": true,
    "copay": "$25",
    "deductible_remaining": "$150",
    "coverage_percentage": "80%",
    "prior_authorization_required": false
  },
  "message": "Your Blue Cross Blue Shield insurance is accepted and verified"
}
```

## Support

For issues or questions:
- Check server logs in terminal
- Verify all environment variables in .env file
- Ensure all dependencies installed: `npm install`
- Check API documentation in `/docs` folder