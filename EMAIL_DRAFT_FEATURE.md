# Email Draft Feature

## Overview

The Email Draft feature helps you quickly generate personalized outreach emails to startup founders directly from the startup detail page. It uses template-based generation with optional AI polishing.

## Location

The feature appears at the bottom of each startup detail page, below the Brief section.

## Email Types

Three email templates are available:

### 1. Initial Outreach
- First contact with a founder
- Introduces you and Innovis VC
- Highlights why their company caught your attention
- Requests a 20-minute call

### 2. Follow-up
- Sent when you haven't heard back
- Respectful and non-pushy tone
- Leaves the door open for future contact
- Maintains relationship even if timing isn't right

### 3. Call Request
- Used when a founder has shown interest
- Includes specific time slots
- More direct call-to-action
- Professional scheduling format

## How to Use

1. **Navigate to a startup detail page**
   - Go to `/startups/[id]` for any startup

2. **Scroll to the Email Draft section**
   - Located at the bottom of the right column

3. **Select email type**
   - Choose from: Initial Outreach, Follow-up, or Call Request

4. **Click "Generate Draft"**
   - A personalized email will be generated using the startup's data

5. **Review and edit** (optional)
   - The draft appears in an editable text area
   - Modify as needed

6. **Polish with AI** (optional)
   - Click "✦ Polish with AI" to improve tone and clarity
   - Requires `ANTHROPIC_API_KEY` in `.env.local`

7. **Copy or Open in Mail**
   - **Copy**: Copies subject + body to clipboard
   - **Open in Mail**: Opens your default email client with pre-filled fields

## Personalization

Emails are automatically personalized with:
- Founder name (from the first founder in the database)
- Startup name
- Sector/industry
- Accelerator/incubator (if applicable)
- Traction highlights
- Problem statement
- Your name and title at Innovis VC

## Your Profile

The emails use this identity:
- **Name**: Renato Moscati
- **Title**: Investment Team
- **Firm**: Innovis VC
- **Email pattern**: `renato.moscati@innovis.vc`

## Templates

### Initial Outreach Template Structure
```
Dear [Founder],

Introduction (who you are, Innovis VC)
Why you're reaching out (specific to their company)
Highlights (traction, problem, team)
Your investment thesis (pre-seed/seed, hands-on)
Call-to-action (20-min call request)

Best regards,
Renato Moscati
Investment Team | Innovis VC
```

### Follow-up Template Structure
```
Hi [Founder],

Gentle follow-up
Acknowledgment of busy schedule
Reiteration of interest
No-pressure approach

Best,
Renato
```

### Call Request Template Structure
```
Hi [Founder],

Thanks for connecting
Request for 20-min call
About Innovis VC (bullet points)
Available time slots (CET)
Flexibility offer

Looking forward,
Renato
```

## AI Polish

If you have an Anthropic API key set up:

1. Click "✦ Polish with AI"
2. The AI will:
   - Make the email more concise
   - Improve tone (warm but professional)
   - Remove generic phrases
   - Keep it under 200 words
   - Maintain authenticity

**Note**: AI polish is optional. The base templates work well on their own.

## Best Practices

1. **Always personalize further**
   - Add specific details about why you're interested
   - Reference recent news or achievements
   - Mention mutual connections if applicable

2. **Keep it short**
   - Founders are busy
   - Get to the point quickly
   - Under 200 words is ideal

3. **Clear call-to-action**
   - Be specific about what you want
   - Suggest concrete next steps
   - Make it easy to say yes

4. **Follow up appropriately**
   - Wait 5-7 days before first follow-up
   - Second follow-up after another week
   - Then move on unless they reach out

5. **Track your outreach**
   - Use the Outreach section to log sent emails
   - Record responses and follow-ups
   - Note what worked and what didn't

## Technical Details

- **Component**: `EmailDraftSection`
- **Action**: `generateEmailDraft`
- **API Route**: `/api/email-draft`
- **Streaming**: AI polish uses streaming for real-time feedback

## Environment Variables

For AI polish feature:
```
ANTHROPIC_API_KEY=your_key_here
```

Without this, the base template generation still works — only AI polish will be unavailable.

## Future Enhancements

Potential improvements:
- Custom email templates
- A/B testing subject lines
- Email open tracking integration
- Scheduled sending
- Bulk personalized outreach
- LinkedIn message templates
- Response rate analytics
