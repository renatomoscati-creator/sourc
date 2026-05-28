# Troubleshooting Guide: Real Cases from Milan Startup Enrichment

## Case Studies

### Case 1: Welfin - Wrong Domain in Database
**Problem:** Database had `welfin.io` which was unreachable  
**Root Cause:** Incorrect domain recorded  
**Solution:** 
1. Searched PoliHub portfolio page
2. Found correct URL: `https://www.welfin.it/`
3. Scraped contact: `info@welfin.it`

**Lesson:** Always verify domain via aggregator when scraping fails

---

### Case 2: Volta Structural Energy - Website Unreachable
**Problem:** `voltastructural.energy` returned fetch failed  
**Root Cause:** SSL or server issues  
**Solution:**
1. Web search: "Volta Structural Energy contact email phone"
2. Found Italian Space Industry catalog entry
3. Extracted: `info@voltase.energy`, `+39 3343699161`

**Lesson:** Industry-specific catalogs are goldmines for contact data

---

### Case 3: Flochip - No Public Website
**Problem:** No dedicated website exists  
**Root Cause:** Early-stage Polihub startup without public presence  
**Solution:** 
- Marked as "no public contact info available"
- Noted: Polihub portfolio company, optofluidic chip technology

**Lesson:** Some startups are pre-public, accept this limitation

---

### Case 4: Photon Path - Contact on /contact Page Only
**Problem:** Homepage had no contact info  
**Root Cause:** Contact details only on dedicated contact page  
**Solution:**
1. Homepage scrape returned: LinkedIn only
2. Scraped `https://www.photon-path.com/contact`
3. Found: `info@photon-path.com`, `+39 02 9177 3058`

**Lesson:** Always scrape both homepage AND /contact page

---

### Case 5: Blimp - LinkedIn in Footer, Email on /contatti
**Problem:** Contact info split across pages  
**Root Cause:** 
- LinkedIn in homepage footer
- Email only on Italian contact page

**Solution:**
1. Homepage: Found LinkedIn URL
2. `/contatti` page: Found `info@blimp.ai`

**Lesson:** Combine data from multiple pages

---

### Case 6: GraphiCore - LinkedIn Only, No Email
**Problem:** Website uses contact form only  
**Root Cause:** Startup prefers form over public email  
**Solution:**
- Extracted LinkedIn: `https://www.linkedin.com/company/graphicore`
- No email included in output (correct behavior)

**Lesson:** Don't fabricate data, only include what's found

---

### Case 7: Sinergy Flow - Duplicate Database Entries
**Problem:** Both "Synergy Flow" and "Sinergy Flow" in database  
**Root Cause:** Data entry inconsistency  
**Solution:**
- Unified to `https://www.sinergyflow.com`
- Contact: `info@sinergyflow.com`

**Lesson:** Check for name variations when querying

---

### Case 8: HelioSwitch / HelioƧwitch - Character Encoding
**Problem:** Database has "HelioƧwitch" (with Ƨ character)  
**Root Cause:** Special character in name  
**Solution:**
- Search with normalized name: "Helioswitch startup Milan"
- Found website: `https://www.helioswitch.cloud`
- Contact: `info@helioswitch.cloud`

**Lesson:** Normalize names for web searches

---

## Common Error Patterns

### Error: "fetch failed"
**Causes:**
- SSL certificate issues
- Server timeout
- Geo-blocking

**Solutions:**
1. Try `http://` instead of `https://`
2. Try `www.` subdomain variant
3. Use web_search to find alternative URL
4. Check aggregator sites

---

### Error: "404 Not Found" on /contact
**Causes:**
- Wrong path (`/contatti` vs `/contact`)
- No dedicated contact page

**Solutions:**
1. Try variations: `/contatti`, `/contact-us`, `/get-in-touch`
2. Check homepage footer for contact info
3. Look for "Contact" link in navigation

---

### Error: No Email Found
**Causes:**
- Contact form only (no public email)
- Email obfuscated (JavaScript rendering)
- Startup prefers LinkedIn/other channels

**Solutions:**
1. Accept limitation - don't include email in output
2. Check if phone or LinkedIn available
3. Note: "prefers contact form"

---

### Error: LinkedIn URL Null
**Causes:**
- Icon present but href not in scraped content
- Different social platform used
- No social media presence

**Solutions:**
1. Construct URL: `https://www.linkedin.com/company/{company-name}`
2. Web search: "{company} LinkedIn"
3. Accept null if truly not found

---

## Decision Tree

```
Startup has website?
├─ No → Web search for website
│   └─ Found → Update DB, continue
│   └─ Not found → Check PoliHub
│       └─ Found → Update DB, continue
│       └─ Not found → Skip (early stage)
└─ Yes → Scrape homepage
    ├─ Contact info found → Record it
    └─ No contact info → Scrape /contact page
        ├─ Found → Record it
        └─ Not found → Check aggregator
            ├─ PoliHub has website → Re-scrape
            └─ Web search for contact → Record if found
```

## Output Quality Rules

1. **Never include null values** - Omit field entirely
2. **Never include empty strings** - Skip the startup
3. **Normalize emails** - Lowercase (usually)
4. **Format phones** - International format (+39 ...)
5. **Full LinkedIn URLs** - No shorteners

## Batch Processing Tips

1. **Process in parallel** - 6 web_fetch calls at once
2. **Track failures** - Note which startups need manual review
3. **Update incrementally** - Write JSON as you go
4. **Verify at end** - Check all websites have been updated
