# Urban Clean Voice Agent Demo - Context Document

## Overview
Urban Clean is a home cleaning service company in Hyderabad that needs an AI voice agent for booking services. This document provides context for building a demo to showcase the voice agent capabilities.

---

## Client Details

| Field | Value |
|-------|-------|
| **Company** | Urban Clean |
| **Decision Maker** | Arwin (26 yrs IT experience, ex-JPMorgan VP) |
| **Location** | Hyderabad, India |
| **Services** | Bathroom cleaning, Deep cleaning, Sofa cleaning, Full home cleaning |
| **Current Volume** | ~160 leads/day (potential to scale to 1500+) |
| **Peak Hours** | 8 AM - 1 PM |
| **Primary Channels** | 98% WhatsApp + calls (website minimal) |
| **Target Audience** | 85% male, 25-35 age group, English/Hindi speakers |

---

## What Arwin Wants in the Demo

### Core Requirements
1. **Visual Display During Voice Call** - As the AI speaks, show visual elements on screen:
   - Time slot selection grid
   - Service cards with prices
   - Payment link display
   - Booking confirmation with details

2. **AI Should Announce Visuals** - The voice should say things like:
   - "I'm displaying the time slots on your screen for easier selection"
   - "I'm sending you the payment link, please complete the payment"
   - "I'm displaying your booking details - please review and confirm"

3. **Complete Happy Path Flow**:
   ```
   Customer calls → AI greets
   → Customer selects service (e.g., bathroom cleaning)
   → AI asks quantity → Customer says "2 bathrooms"
   → AI calculates: "2 bathrooms × ₹500 = ₹1000 + 18% GST = ₹1,180"
   → Display time slots visually → Customer selects date/time
   → AI reads back confirmation → Customer confirms
   → Payment link displayed on screen
   → Customer completes payment → AI confirms with Booking ID
   → Display all booking details → Ask for feedback
   ```

4. **Natural Human-like Voice** - Not robotic, should sound warm and empathetic

5. **Post-Service Feedback Call** - AI calls back customer after service for:
   - Feedback collection
   - Google review request
   - Discount coupon for positive feedback

### Future Vision (Not for immediate demo)
- Proactive booking reminders based on patterns
- Integration with MyGate (if maid hasn't come, offer service)
- Personalized greetings using customer's preferred name
- Multi-language support (Telugu, Hindi, English)

---

## What Has Been Built

### Demo Page Location
```
/app/demo/urban-clean/page.tsx
```
URL: `http://localhost:3000/demo/urban-clean`

### Current Features
1. **Split-screen layout**:
   - Left side: Voice agent with animated Orb visualization
   - Right side: Visual booking display that updates during conversation

2. **Visual Steps Implemented**:
   - `idle` - Start screen
   - `greeting` - Welcome with customer address
   - `service_selection` - Cards for Bathroom, Deep, Sofa, Full Home cleaning
   - `quantity_selection` - +/- buttons with live price calculation (including GST)
   - `slot_selection` - Time slot grid (some marked unavailable)
   - `confirmation` - Full booking summary
   - `payment` - Payment link display with waiting animation
   - `success` - Booking confirmed with ID
   - `out_of_area` - Service not available message

3. **Simulation Mode** - Hardcoded script that auto-plays the booking flow

4. **Voice Integration** - ElevenLabs TTS API (configured but needs better voice)

### Files Created/Modified
- `/app/demo/urban-clean/page.tsx` - Main demo page
- `/app/api/tts/route.ts` - ElevenLabs TTS API route
- `/.env.local` - Contains ElevenLabs API key

---

## What's Remaining / Issues

### 1. Voice Quality (Critical)
The current voice sounds mechanical. Options:
- **Pre-record audio files** using ElevenLabs website (can use premium voices there)
- **Upgrade ElevenLabs** to paid plan ($5/month) for better API voices
- **Use a different TTS provider** (e.g., OpenAI TTS, Google Cloud TTS)

### 2. Pre-recorded Audio Setup
If using pre-recorded audio, need to:
1. Generate MP3 files for each dialogue line
2. Store in `/public/audio/urban-clean/`
3. Update demo code to play audio files instead of TTS API

**Dialogue lines to record:**
```
1. "Hi Arwin! I'm Priya from Urban Clean. How can I assist you today?"

2. "I'm displaying our services on your screen. We have Bathroom Cleaning at 500 rupees, Deep Cleaning, Sofa Cleaning, and Full Home Cleaning. Which service would you like?"

3. "Great choice! How many bathrooms would you like us to clean?"

4. "Perfect! 2 Bathroom Cleaning will be 1000 rupees plus 18% GST, which comes to 1180 rupees. I'm now displaying available time slots on your screen. Please select your preferred date and time."

5. "I'm displaying your booking summary on screen. You've selected 2 Bathroom Cleaning for April 27, 2026 at 11:00 AM, total 1180 rupees. The service will be at Block 1, Flat 1101, My Home Mangala, Kondapur. Please review and confirm."

6. "Excellent! I'm sending you the payment link now. Please complete the payment to confirm your booking."

7. "Payment received! Your booking is confirmed. Your booking ID is UC123456. Our team will arrive at 11:00 AM on April 27, 2026. Thank you for choosing Urban Clean! Is there anything else I can help you with?"

8. "You're most welcome! We appreciate your trust in Urban Clean. Have a wonderful day!"
```

### 3. Additional Features to Add (Optional)
- Feedback collection flow after booking
- Out-of-service-area flow with feedback collection
- User response simulation (currently just shows text)

---

## Commercial Terms Discussed

| Item | Details |
|------|---------|
| Trial Period | 2 months |
| Trial Cost | ₹25K/month (implementation charges) |
| Per-minute costs | Urban Clean pays |
| Post-trial | 3-6 month minimum contract |
| NDA | Required |
| Non-compete | 2 years - no similar solutions for competitors |

---

## Technical Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS 4
- **Voice SDK**: @vapi-ai/web (for real Vapi integration)
- **TTS**: ElevenLabs API (@elevenlabs/react installed)
- **3D Visualization**: Three.js (@react-three/fiber) for Orb animation

---

## Environment Variables Needed

```env
# ElevenLabs TTS
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Rachel - free tier

# Vapi (for real voice agent, not simulation)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_key
NEXT_PUBLIC_URBAN_CLEAN_ASSISTANT_ID=your_assistant_id
```

---

## How to Run

```bash
cd /Users/ajinkya642000/Desktop/365/MagicalCX/magicalcx-web
git checkout voice-vapi
npx pnpm install
npx next dev --turbopack
# Open http://localhost:3000/demo/urban-clean
```

---

## Key Insight from Arwin

> "I'm not looking for basic. When we say we are part of your family, you should really be part of their life. The app should know that you partied last night and proactively ask if you want living room cleaning."

The demo should impress with smooth visuals and natural voice - showing what's possible, not just basic functionality.
