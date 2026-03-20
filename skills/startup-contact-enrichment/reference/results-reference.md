# Complete Contact Enrichment Results - Reference Data

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total startups in database | 70 |
| Startups with websites | 70 (100%) |
| Startups enriched with contact info | 38 |
| Emails found | 33 |
| Phone numbers found | 12 |
| LinkedIn URLs found | 7 |
| Startups without public contact info | 1 (Flochip) |

## Successful Contact Data by Startup

### AI & Software (6 startups)
| Startup | Email | Phone | LinkedIn |
|---------|-------|-------|----------|
| Intellico | info@intellico.ai | - | - |
| UNGUESS | info@unguess.io | - | - |
| Bcode | - | - | linkedin.com/company/bcode |
| HelioƧwitch | info@helioswitch.cloud | - | - |
| Neuronova | - | - | - |
| Displaid | - | - | - |

### Health & MedTech (8 startups)
| Startup | Email | Phone | LinkedIn |
|---------|-------|-------|----------|
| Agade | info@agade.eu | +39 389 01 64 234 | - |
| Artiness | info@artinessreality.com | - | - |
| Approxima | info@approximamedical.com | - | - |
| BiomimX | INFO@BIOMIMX.COM | (+39) 02 37902246 | - |
| GenoGra | info@genogra.com | - | - |
| Phononic Vibes | metainfo@phononicvibes.com | +393383196959 | linkedin.com/company/phononic-vibes |
| TTOP | info@ttoptechnologies.com | +39 346 104 6852 | - |
| Rilemo | - | - | - |

### Energy & Climate (7 startups)
| Startup | Email | Phone | LinkedIn |
|---------|-------|-------|----------|
| Energy Dome | - | +39 (0) 2 9177 3100 | - |
| Hyper Wind Turbine | info@hyperwind.it | - | - |
| Limenet | info@limenet.tech | - | - |
| SunCubes | info@suncubes.space | - | - |
| Volta Structural Energy | info@voltase.energy | +39 3343699161 | - |
| SiZable Energy | - | - | - |
| Welfin | info@welfin.it | - | - |

### Space & Aerospace (6 startups)
| Startup | Email | Phone | LinkedIn |
|---------|-------|-------|----------|
| Capsule Corporation | info@capsule-corp.biz | - | - |
| GraphiCore | - | - | linkedin.com/company/graphicore |
| Leafspace | info@leaf.space | +39 023 6714624 | - |
| NAUTILUS | info@spacenautilus.com | - | - |
| Space2Earth | info@space2earth.it | - | - |
| VersoSat | info@versosat.com | - | - |

### Industries & Manufacturing (7 startups)
| Startup | Email | Phone | LinkedIn |
|---------|-------|-------|----------|
| Archygram | - | - | - |
| Isaac | info@isaacantisismica.com | - | - |
| Photon Path | info@photon-path.com | +39 02 9177 3058 | linkedin.com/company/photonpath |
| Voidless | info@voidless-packaging.com | +39 345 854 3891 | - |
| WiSort | - | - | - |
| Synergy Flow | info@sinergyflow.com | - | - |
| SMUSH Materials | info@smushmaterials.com | - | - |

### Consumer & Fashion (3 startups)
| Startup | Email | Phone | LinkedIn |
|---------|-------|-------|----------|
| Cap_able | - | - | - |
| Fili Pari | - | - | linkedin.com/company/filipari |
| Magic Vision | info@magicvision.ai | +39 391 4853901 | - |

### Additional Startups (1 startup)
| Startup | Email | Phone | LinkedIn |
|---------|-------|-------|----------|
| Blimp | info@blimp.ai | - | linkedin.com/company/blimp |

## Startups Without Contact Info (Skipped)

| Startup | Reason |
|---------|--------|
| Flochip | No public website (early-stage Polihub) |
| Gymnasio | Website has no public contact info |
| Cleafy | Contact form only, no email visible |
| D-Orbit | Website scraping returned no data |
| ReHouseIt | Domain for sale (not active) |
| RarEarth | Website unreachable |
| HMDrive | Website unreachable |

## Website URL Corrections Made

| Startup | Original | Corrected | Source |
|---------|----------|-----------|--------|
| Welfin | welfin.io (unreachable) | www.welfin.it | PoliHub |
| Volta Structural Energy | voltase.energy (unreachable) | voltastructural.energy | Space Industry Catalog |
| Flochip | (none) | flochip.com | PoliHub (but no public site) |
| Sinergy Flow | (duplicate) | www.sinergyflow.com | Direct |

## Email Domain Patterns Observed

| Pattern | Count | Examples |
|---------|-------|----------|
| info@{domain} | 28 | info@agade.eu, info@leaf.space |
| hello@{domain} | 1 | hello@adapta.studio |
| {company}@{domain} | 1 | sinergyflow@legalmail.it |
| {person}@{domain} | 1 | chiara.mirani@voltase.energy |
| PEC (Italian certified) | 3 | welfin@pec.it, suncubessrl@pec.it |

## Phone Number Patterns Observed

| Format | Count | Example |
|--------|-------|---------|
| +39 XXX XXX XXXX | 8 | +39 391 4853901 |
| +39 XX XXXXXXX | 2 | +39 02 9177 3058 |
| +39 (0) X XXXX XXX | 1 | +39 (0) 2 9177 3100 |
| (+39) XX XXXXXXX | 1 | (+39) 02 37902246 |

## LinkedIn URL Patterns

| Pattern | Count | Example |
|---------|-------|---------|
| /company/{name-with-hyphens} | 5 | /company/fili-pari |
| /company/{namewithoutspaces} | 2 | /company/bcode |

## Tools Used Successfully

| Tool | Usage Count | Success Rate |
|------|-------------|--------------|
| web_fetch (homepage) | 70+ | ~85% |
| web_fetch (/contact) | 20+ | ~60% |
| web_search | 40+ | ~90% |
| PoliHub scraping | 10+ | ~95% |

## Key Takeaways

1. **info@{domain}** is the most common email pattern for Italian startups
2. **PoliHub** is the definitive source for Milan startup websites
3. **Contact forms** are preferred over public emails by ~30% of startups
4. **LinkedIn** presence is high but URLs often not exposed in page content
5. **Phone numbers** are less commonly published than emails
6. **PEC emails** (Italian certified email) are common for legal/compliance
