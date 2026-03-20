# Aggregator Sites for Startup Contact Enrichment

## Primary Aggregator: PoliHub

PoliHub is the Politecnico di Milano startup incubator. Most Milan-based deep tech startups are incubated there.

### Portfolio Page URLs
```
https://polihub.it/portfolio/{startup-slug}/       # Italian version
https://polihub.it/en/portfolio/{startup-slug}/    # English version
```

### What PoliHub Pages Contain
| Field | Location | Reliability |
|-------|----------|-------------|
| Official Website | "Sito web" section | Very High |
| Description | Main content | High |
| Sector/Industry | Portfolio filter | High |
| Contact Info | Rarely (use startup's own site) | Low |

### How to Extract Website from PoliHub
```
web_fetch prompt:
"Extract the official startup website URL from this page. 
Look for any external link (not polihub.it) that is the startup's official website. 
Return JSON: {"website": null or url}"
```

### Known PoliHub Startups (70+ portfolio companies)
The portfolio page at `https://polihub.it/en/portfolio/` lists all incubated startups with their websites.

## Secondary Aggregators

### LinkedIn Company Search
```
web_search query: "{startup_name} startup Milan LinkedIn"
```
Use when LinkedIn URL not found on website footer.

### Crunchbase
```
web_search query: "{startup_name} startup Crunchbase"
```
Contains funding info, sometimes contact details.

### Italian Space Industry Catalog (for space startups)
```
https://italianspaceindustry.it/listing/{company-name}/
```
Contains verified contact info for space/aerospace startups.

### EU-Startups Directory
```
https://www.eu-startups.com/directory/{startup-name}/
```
European startup directory with basic info.

### Tracxn
```
web_search query: "{startup_name} startup Tracxn"
```
Contains company profile, sometimes website and contact info.

## Aggregator Fallback Strategy

```
1. Try direct website scraping (homepage + /contact)
   ↓ (if no results)
2. Fetch PoliHub portfolio page for official website
   ↓ (if website differs from database)
3. Update database with correct website, re-scrape
   ↓ (if still no results)
4. Web search for "{startup} contact email phone"
   ↓ (if still no results)
5. Check secondary aggregators (LinkedIn, Crunchbase)
   ↓ (if still no results)
6. Mark as "no public contact info available"
```

## Aggregator-Specific Patterns

### PoliHub
- Look for "Sito web" → external URL
- Social links are PoliHub's, not startup's
- Address shown is often PoliHub's (Via Durando 39)

### LinkedIn
- URL format: linkedin.com/company/{name}
- May need to construct from company name
- Company size, industry visible

### Italian Space Industry
- Direct contact email and phone
- Named contact person (e.g., "Chiara Mirani - COO")
- Highly reliable for space sector

## Example Aggregator Queries

```bash
# Find startup website via PoliHub
web_fetch https://polihub.it/portfolio/flochip/

# Find contact via industry catalog
web_fetch https://italianspaceindustry.it/listing/volta-structural-energy/

# Find LinkedIn via search
web_search "Bcode startup Milan LinkedIn company"
```

## Known Limitations

| Aggregator | Limitation |
|------------|------------|
| PoliHub | No direct contact info, only website |
| LinkedIn | Requires URL construction, may be outdated |
| Crunchbase | Paywall for detailed contact info |
| Tracxn | Limited free data |
| EU-Startups | Basic info only |

## Best Practices

1. **Always verify** aggregator data against official website when possible
2. **Prefer direct sources** (company website) over aggregators
3. **Use aggregators for discovery**, not final contact data
4. **Cross-reference** multiple sources for critical data
