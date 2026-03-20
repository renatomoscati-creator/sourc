---
name: startup-contact-enrichment
description: Enrich startup database with contact information by scraping company websites and aggregator sites (PoliHub, LinkedIn, etc.). Use when startups have websites but missing contactEmail, contactPhone, or contactLinkedin fields.
trigger terms: enrich contacts, scrape contact info, startup database, contact enrichment, find startup emails, sourcing tool
---

# Startup Contact Enrichment Skill

## Objective
- Scrape contact information (email, phone, LinkedIn) from startup websites
- Fall back to aggregator sites (PoliHub, Crunchbase, LinkedIn) when direct scraping fails
- Output structured JSON for database updates with only non-null values

## Workflow (Must Follow Sequence)

1. **Query Database** - Find startups with website but missing contact fields
2. **Direct Website Scraping** - Fetch homepage and /contact page for each startup
3. **Aggregator Fallback** - Use PoliHub portfolio pages when direct scraping fails
4. **Web Search Fallback** - Search for website URL when not in database
5. **Compile Results** - Write JSON array with only startups where info was found

## Process Steps

### Step 1: Database Query
```bash
sqlite3 data/sourcing.db "SELECT id, name, website, contact_email, contact_phone, contact_linkedin FROM startups WHERE website IS NOT NULL AND (contact_email IS NULL OR contact_email = '')"
```

### Step 2: Scrape Each Website
For each startup, use `web_fetch` tool:
- Primary: Homepage URL from database
- Secondary: `/contact` or `/contatti` page
- Extract: emails (mailto: or @ patterns), phones, LinkedIn company URLs

### Step 3: Aggregator Fallback (PoliHub)
When direct scraping returns empty results:
```
https://polihub.it/portfolio/{startup-name-slug}/
https://polihub.it/en/portfolio/{startup-name-slug}/
```
Use `web_fetch` to extract the official website URL from the "Sito web" field.

### Step 4: Web Search Fallback
When website is missing or unreachable:
```
web_search: "{startup_name} startup Milan website official"
web_search: "{startup_name} startup contact email phone"
```

### Step 5: Compile Update Queue
Write JSON array to `data/update-queue.json`:
```json
[
  {
    "startupName": "Startup Name",
    "changes": {
      "contactEmail": "found@email.com",
      "contactPhone": "+39 xxx xxx xxxx",
      "contactLinkedin": "https://linkedin.com/company/..."
    }
  }
]
```

## Output Rules

- **Only include startups where contact info was actually found**
- **Never include null or empty values in changes object**
- **Normalize email to lowercase** (except when case-sensitive like INFO@...)
- **Keep phone numbers in international format** (+39 ...)
- **Use full LinkedIn company URLs** (https://www.linkedin.com/company/...)

## Error Handling

| Error | Action |
|-------|--------|
| Website unreachable (fetch failed) | Try web_search for alternative URL |
| 404 on /contact page | Only use homepage data |
| No contact info on page | Check PoliHub aggregator |
| Flochip-style (no website exists) | Skip, note as "early stage, no public site" |

## Tools Required

- `web_fetch` - For scraping website content
- `web_search` - For finding websites and contact info
- `run_shell_command` - For SQLite queries
- `write_file` - For outputting update-queue.json

## Success Criteria

- All reachable websites scraped
- Aggregator sites used as fallback
- Only valid, non-empty contact info in output
- Database updated with discovered website URLs
