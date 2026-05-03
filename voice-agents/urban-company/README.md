# Urban Company — voice agent demo

Prospect demo targeting **Urban Company** (formerly UrbanClap). Same architecture as Urban Klean but with Urban Company branding, services, and at-scale analytics numbers.

## Brand

| Token | Value |
|-------|-------|
| Header bg | `#1c1c2e` (dark navy) |
| Primary accent | `#f97316` (orange) |
| Primary text | `#ea580c` (orange-600) |
| Agent name | Kavya |
| Logo badge | `UC` (white on orange) |

## Layout

| Path | Purpose |
|------|---------|
| `src/main-demo.tsx` | Voice call UI — Home Cleaning, Salon at Home, AC Service, Appliance Repair |
| `src/triggers-page.tsx` | Proactive triggers / outbound pitch demo |
| `src/analytics-page.tsx` | Analytics dashboard (UC-scale: 1,527 calls, ₹11.4L/week, 61% conversion) |

## Next.js routes (main app)

- `app/demo/urban-company/page.tsx` → `main-demo.tsx`
- `app/demo/urban-company/triggers/page.tsx` → `triggers-page.tsx`
- `app/demo/urban-company/analytics/page.tsx` → `analytics-page.tsx`

## Services in this demo

| Service | Price | Unit |
|---------|-------|------|
| Home Cleaning | ₹649 | room |
| Salon at Home | ₹499 | session |
| AC Service | ₹399 | AC |
| Appliance Repair | ₹299 | appliance |

## Env var

```
NEXT_PUBLIC_URBAN_COMPANY_ASSISTANT_ID=your_assistant_id
```

## Differences from Urban Klean

- Orange + dark navy instead of purple + yellow
- Broader services (salon, AC, repairs vs. cleaning-only)
- UC-scale analytics numbers (1,527 calls vs 694, ₹11.4L vs ₹4.82L)
- Agent name: **Kavya** (vs Sakshi)
- Out-of-area scenario: Narsingi (vs GHR Titania)
- Payment URL: `pay.urbancompany.com` (vs `pay.urbanklean.in`)
- Booking ID prefix: `UCP` (vs `UC`)
