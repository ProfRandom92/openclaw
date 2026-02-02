# Job Boards and APIs

Comprehensive list of job boards, APIs, and resources for automated job searching in Germany and Europe.

## German Job Boards

### 1. StepStone
- **URL:** https://www.stepstone.de
- **Focus:** Professional/technical roles
- **Coverage:** Germany, Europe
- **API:** No official public API
- **Scraping:** Requires headless browser
- **Best for:** Mid to senior level IT/engineering roles
- **Notes:** One of the largest job boards in Germany

### 2. Indeed Germany
- **URL:** https://de.indeed.com
- **Focus:** All job types
- **Coverage:** Worldwide, strong in Germany
- **API:** Partner API (application required)
- **Scraping:** Possible with rate limiting
- **Best for:** Volume searching across industries
- **Notes:** Aggregates from many sources

### 3. XING Jobs
- **URL:** https://www.xing.com/jobs
- **Focus:** Professional network + jobs
- **Coverage:** DACH region (Germany, Austria, Switzerland)
- **API:** XING API (restricted access)
- **Scraping:** Requires login/session
- **Best for:** Networking + job search
- **Notes:** LinkedIn alternative for German market

### 4. LinkedIn Jobs
- **URL:** https://www.linkedin.com/jobs
- **Focus:** Professional roles
- **Coverage:** Worldwide
- **API:** LinkedIn API (restricted)
- **Scraping:** Requires authentication
- **Best for:** International companies, tech roles
- **Notes:** Strong in tech/startup scene

### 5. Monster Germany
- **URL:** https://www.monster.de
- **Focus:** All job types
- **Coverage:** Germany
- **API:** No public API
- **Scraping:** Possible
- **Best for:** Traditional industries
- **Notes:** Established player, less popular than StepStone

### 6. Jobware
- **URL:** https://www.jobware.de
- **Focus:** Professional/technical
- **Coverage:** Germany
- **API:** No public API
- **Scraping:** Possible
- **Best for:** Engineering, IT, management
- **Notes:** Quality over quantity

## Tech-Specific Job Boards

### 7. Stack Overflow Jobs
- **URL:** https://stackoverflow.com/jobs
- **Focus:** Software developers
- **Coverage:** Worldwide
- **API:** Stack Exchange API
- **Best for:** Developer roles
- **Notes:** High-quality developer positions

### 8. GitHub Jobs
- **URL:** https://jobs.github.com (deprecated, now redirects)
- **Status:** Closed (2021)
- **Alternative:** Use LinkedIn, Stack Overflow, or company sites

### 9. Honeypot
- **URL:** https://www.honeypot.io
- **Focus:** Tech/developer roles
- **Coverage:** Europe
- **API:** No public API
- **Best for:** Software developers, DevOps, Data
- **Notes:** Reverse job board (companies apply to you)

### 10. WeAreDevelopers
- **URL:** https://www.wearedevelopers.com/jobs
- **Focus:** Software developers
- **Coverage:** Europe
- **Best for:** Developer community roles

## Company Career Pages

### Top Tech Companies in Germany

1. **SAP**
   - URL: https://jobs.sap.com
   - Locations: Walldorf, Berlin, Munich
   - Focus: Enterprise software, Cloud, AI

2. **Siemens**
   - URL: https://jobs.siemens.com
   - Locations: Munich, Berlin, Erlangen
   - Focus: Industrial automation, IoT, AI

3. **Microsoft Germany**
   - URL: https://careers.microsoft.com/de-de
   - Locations: Munich, Berlin, Cologne
   - Focus: Cloud, AI, Software

4. **Google Germany**
   - URL: https://careers.google.com/locations/germany
   - Locations: Munich, Berlin, Hamburg
   - Focus: Cloud, AI, Search, Ads

5. **Amazon Germany**
   - URL: https://www.amazon.jobs/de
   - Locations: Berlin, Munich, Dresden
   - Focus: AWS, E-commerce, Logistics

6. **BMW Group**
   - URL: https://www.bmwgroup.jobs
   - Locations: Munich, Regensburg
   - Focus: Automotive software, AI, IoT

7. **Volkswagen/Audi**
   - URL: https://www.volkswagenag.com/de/careers.html
   - Locations: Wolfsburg, Ingolstadt, Munich
   - Focus: Automotive software, autonomous driving

8. **Bosch**
   - URL: https://www.bosch.com/careers
   - Locations: Stuttgart, Munich, Dresden
   - Focus: IoT, AI, Automotive

9. **Deutsche Telekom**
   - URL: https://www.telekom.com/karriere
   - Locations: Bonn, Berlin, Darmstadt
   - Focus: Cloud, 5G, Cybersecurity

10. **Zalando**
    - URL: https://jobs.zalando.com
    - Locations: Berlin, Dortmund
    - Focus: E-commerce, Fashion Tech, AI

## Job Aggregators with APIs

### 11. Adzuna
- **URL:** https://www.adzuna.de
- **API:** ✅ Free API available
- **Documentation:** https://developer.adzuna.com
- **Rate Limits:** 100 calls/month (free tier)
- **Coverage:** Germany, Europe, Worldwide
- **Best for:** Automated searching
- **API Key:** Required (free signup)

**API Example:**
```bash
curl "https://api.adzuna.com/v1/api/jobs/de/search/1?app_id=YOUR_ID&app_key=YOUR_KEY&results_per_page=20&what=AI%20Developer&where=Germany"
```

### 12. The Muse
- **URL:** https://www.themuse.com
- **API:** ✅ Public API
- **Documentation:** https://www.themuse.com/developers/api/v2
- **Coverage:** Mainly US, some international
- **Best for:** Company culture research

### 13. Jooble
- **URL:** https://de.jooble.org
- **API:** ✅ Free API
- **Documentation:** https://de.jooble.org/api/about
- **Coverage:** Germany, Europe
- **Best for:** Aggregated results

### 14. Reed (UK)
- **URL:** https://www.reed.co.uk
- **API:** ✅ Free API
- **Coverage:** UK primarily
- **Best for:** UK job search

## Startup & Scale-up Job Boards

### 15. AngelList (Wellfound)
- **URL:** https://wellfound.com
- **Focus:** Startups, early-stage companies
- **Coverage:** Worldwide
- **Best for:** Startup ecosystem, equity positions

### 16. StartUs
- **URL:** https://www.startus.cc/jobs
- **Focus:** German startups
- **Coverage:** Germany
- **Best for:** Startup jobs in Germany

### 17. Startup Jobs
- **URL:** https://startup.jobs
- **Focus:** Berlin startup scene
- **Coverage:** Berlin primarily
- **Best for:** Berlin tech scene

## Freelance & Remote Platforms

### 18. Remote.co
- **URL:** https://remote.co
- **Focus:** Remote-first companies
- **Coverage:** Worldwide
- **Best for:** Fully remote positions

### 19. We Work Remotely
- **URL:** https://weworkremotely.com
- **Focus:** Remote jobs
- **Coverage:** Worldwide
- **Best for:** Remote tech roles

### 20. FlexJobs
- **URL:** https://www.flexjobs.com
- **Focus:** Flexible/remote work
- **Coverage:** Worldwide
- **Best for:** Remote, part-time, flexible

### 21. Upwork / Freelancer
- **URL:** https://www.upwork.com, https://www.freelancer.com
- **Focus:** Freelance projects
- **Coverage:** Worldwide
- **Best for:** Contract/freelance work

## Academic & Research Positions

### 22. Academics
- **URL:** https://www.academics.com
- **Focus:** Academic, research, science
- **Coverage:** Germany, Europe
- **Best for:** Research positions, PhD, PostDoc

### 23. ResearchGate Jobs
- **URL:** https://www.researchgate.net/jobs
- **Focus:** Research positions
- **Coverage:** Worldwide
- **Best for:** Academic research roles

## Government & Public Sector

### 24. Interamt
- **URL:** https://www.interamt.de
- **Focus:** Public sector jobs
- **Coverage:** Germany
- **Best for:** Government positions

### 25. Bund.de
- **URL:** https://www.bund.de/SiteGlobals/Forms/Stellen/Stellensuche_Formular.html
- **Focus:** Federal government
- **Coverage:** Germany
- **Best for:** Federal government roles

## Specialized Tech Boards

### 26. CyberSecurity Jobs
- **URL:** https://www.cybersecurityjobs.net
- **Focus:** Cybersecurity roles
- **Coverage:** Worldwide
- **Best for:** Security specialist positions

### 27. AI Jobs
- **URL:** https://aijobs.net
- **Focus:** AI/ML roles
- **Coverage:** Worldwide
- **Best for:** AI/ML engineer positions

### 28. Data Science Jobs
- **URL:** https://www.datasciencejobs.com
- **Focus:** Data science, analytics
- **Coverage:** Worldwide
- **Best for:** Data scientist, analyst roles

### 29. DevOps Jobs
- **URL:** https://devopsjobs.net
- **Focus:** DevOps, SRE, Platform engineering
- **Coverage:** Worldwide
- **Best for:** DevOps/SRE positions

## How to Use These Resources

### Automated Scraping Strategy

1. **API First:** Use Adzuna, Jooble, The Muse for bulk searches
2. **Manual Scraping:** StepStone, Indeed, LinkedIn (with rate limiting)
3. **Company Direct:** Check career pages for target companies
4. **Specialized Boards:** Focus on tech-specific boards for relevant roles

### Search Frequency

- **APIs:** Daily automated searches
- **Manual:** Weekly review of top boards
- **Company Pages:** Monthly check of target companies
- **Specialized:** Weekly for niche roles

### Priority Order for Your Profile

Based on your skills (AI, Cloud, Security, Microsoft 365):

**Priority 1 (Check Daily):**
1. LinkedIn Jobs
2. Adzuna API
3. StepStone
4. Honeypot
5. Company career pages (Microsoft, SAP, Google, NVIDIA)

**Priority 2 (Check Weekly):**
6. XING Jobs
7. Indeed
8. Stack Overflow
9. AI Jobs
10. CyberSecurity Jobs

**Priority 3 (Check Monthly):**
11. AngelList/Wellfound
12. Remote.co
13. We Work Remotely
14. WeAreDevelopers

## API Integration Tips

### Rate Limiting
- Adzuna: 100 calls/month free (upgrade for more)
- Jooble: 500 calls/day free
- Implement caching to reduce calls
- Store results locally to avoid re-fetching

### Data Normalization
Different boards use different schemas. Normalize to:
```json
{
  "title": "Job Title",
  "company": "Company Name",
  "location": "City, Country",
  "remote": true/false,
  "salary": "€60,000 - €80,000",
  "url": "https://...",
  "source": "Board Name",
  "posted_date": "2025-02-02",
  "description": "Full text...",
  "requirements": ["Skill 1", "Skill 2"]
}
```

### Deduplication
- Hash job URLs to detect duplicates
- Track applied positions to avoid re-applying
- Use company + title + location for fuzzy matching

## Legal Considerations

### Scraping Best Practices
- Respect `robots.txt`
- Implement rate limiting (1-2 requests/second)
- Use appropriate User-Agent
- Cache results to minimize requests
- Comply with GDPR for data storage

### Terms of Service
- Most job boards prohibit automated scraping
- Use official APIs where available
- Consider subscribing to premium API access for commercial use
- Personal use typically tolerated if respectful

## Resources & Tools

### Web Scraping Tools
- **Playwright:** Headless browser automation
- **Scrapy:** Python scraping framework
- **BeautifulSoup:** HTML parsing
- **Puppeteer:** Node.js browser automation

### Job Aggregation Tools
- **RSS Feeds:** Many boards offer RSS feeds
- **Email Alerts:** Set up alerts for new postings
- **Browser Extensions:** Job search helpers

### Tracking Spreadsheets
- Create master sheet of all sources
- Track last checked date
- Note success rate per source
- Monitor application conversion rate
