# Web Scraping Patterns for Startup Contact Info

## Email Extraction Patterns

### Common Locations on Websites
1. **Footer** - Most common, look for "Contact", "Contatti", "Get in touch"
2. **Contact Page** - `/contact`, `/contatti`, `/contact-us`
3. **About Page** - `/about`, `/about-us`, `/chi-siamo`
4. **Header/Nav** - Sometimes in top navigation

### Email Patterns to Detect
```
mailto:email@domain.com          # HTML mailto links
email@domain.com                  # Plain text emails
[email protected]              # Obfuscated emails
INFO@DOMAIN.COM                   # Uppercase emails
name [at] domain [dot] com        # Spam-protected format
```

### Common Email Prefixes for Startups
| Prefix | Likelihood |
|--------|------------|
| info@ | Very High |
| hello@ | High |
| contact@ | High |
| team@ | Medium |
| founders@ | Low |
| ceo@ | Low |

## Phone Number Extraction Patterns

### Italian Phone Formats
```
+39 02 1234567        # Landline with country code
+39 333 1234567       # Mobile with country code
02 1234567            # Landline without country code
333 1234567           # Mobile without country code
(+39) 02 1234567      # Parenthesized country code
+39 (02) 1234567      # Mixed format
```

### Phone Number Locations
1. **Footer** - Most common
2. **Contact Page** - Near contact form
3. **Header** - Sometimes in top bar
4. **Address Block** - Near physical address

## LinkedIn URL Extraction Patterns

### Where to Find LinkedIn
1. **Footer Social Icons** - Look for "Linkedin", "LinkedIn", "In" icon
2. **Contact Page** - Social media section
3. **About Page** - Team/company section

### LinkedIn URL Formats
```
https://www.linkedin.com/company/startup-name
https://linkedin.com/company/startup-name
https://www.linkedin.com/company/startupname
```

### Pattern Recognition
- Company name with hyphens: `company-name`
- Company name without spaces: `companyname`
- Exact company name: `Company Name` → `company-name`

## web_fetch Prompt Template

```
Find all contact information: email addresses, phone numbers, and LinkedIn company page URL. 
Look for patterns like mailto: links, @ symbols, phone number formats, and linkedin.com/company/ URLs. 
Return JSON: {"emails": [], "phones": [], "linkedin": null or url}
```

## Common Scraping Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| No emails found | Contact form only | Check /contact page specifically |
| LinkedIn null | Icon without href | Construct URL from company name |
| Fetch failed | SSL/timeout | Try http:// or www. variant |
| 404 on /contact | Wrong path | Try /contatti, /contact-us, /get-in-touch |
| Placeholder email | example.com domains | Skip, mark as not found |

## Validation Rules

1. **Email**: Must contain @ and valid domain
2. **Phone**: Must have digits, prefer +39 prefix for Italy
3. **LinkedIn**: Must contain linkedin.com/company/

## Batch Processing Strategy

Process startups in batches of 6 parallel `web_fetch` calls:
- Maximizes throughput
- Avoids rate limiting
- Allows quick iteration on failures
