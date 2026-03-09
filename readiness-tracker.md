# Page Readiness Tracker — EDS Migration

**Generated:** 2026-03-09
**Source:** https://www.zelis.com/sitemap_index.xml → AEM Edge Delivery Services
**Total URLs:** 370 | **Imported:** 367 | **Not imported:** 3

## Readiness Thresholds

| Status | Criteria |
|--------|----------|
| READY | >=80% visual similarity (desktop + mobile avg) |
| NEAR | 60-79% visual similarity |
| WORK | <60% visual similarity |
| UNTESTED | Imported but no regression test run |
| N/A | URL cataloged but content not yet imported |

## Overall Summary

```
  Customer Ready:    0 pages
  Near Ready:      225 pages
  Needs Work:      142 pages
  Untested:          0 pages
  Not Imported:      3 pages
  ─────────────────────────
  Total:           370 pages
```

## Template Dashboard

| Template | Pages | Imported | Desktop | Mobile | Avg | Status |
|----------|------:|--------:|---------:|-------:|----:|--------|
| homepage | 1 | 1 | 62.2% | 58.4% | 60.3% | NEAR |
| branded-landing | 1 | 1 | 69.8% | 76.7% | 73.3% | NEAR |
| blog-article | 225 | 223 | 70.5% | 79.0% | 74.8% | NEAR |
| gated-resource | 42 | 42 | 54.7% | 41.4% | 48.1% | WORK |
| case-study | 7 | 6 | 60.1% | 47.0% | 53.5% | WORK |
| solutions-page | 41 | 41 | 49.9% | 19.7% | 34.8% | WORK |
| built-for-audience | 23 | 23 | 57.6% | 31.1% | 44.3% | WORK |
| company-utility | 30 | 30 | 66.1% | 51.0% | 58.6% | WORK |

## Template Details

### homepage

- **Pages:** 1 total, 1 imported (1 manual, 0 bulk)
- **Desktop:** 62.2% ████████████░░░░░░░░
- **Mobile:** 58.4% ████████████░░░░░░░░
- **Average:** 60.3%
- **Tested page:** index
- **Status:** near-ready

### branded-landing

- **Pages:** 1 total, 1 imported (1 manual, 0 bulk)
- **Desktop:** 69.8% ██████████████░░░░░░
- **Mobile:** 76.7% ███████████████░░░░░
- **Average:** 73.3%
- **Tested page:** let-care-flow
- **Status:** near-ready

### blog-article

- **Pages:** 225 total, 223 imported (0 manual, 223 bulk)
- **Desktop:** 70.5% ██████████████░░░░░░
- **Mobile:** 79.0% ████████████████░░░░
- **Average:** 74.8%
- **Tested page:** blog_accelerating-progress-in-healthcare-finance-a-call-to-action
- **Status:** near-ready

### gated-resource

- **Pages:** 42 total, 42 imported (0 manual, 42 bulk)
- **Desktop:** 54.7% ███████████░░░░░░░░░
- **Mobile:** 41.4% ████████░░░░░░░░░░░░
- **Average:** 48.1%
- **Tested page:** white-papers_5-cs-of-payment-integrity
- **Status:** needs-work

### case-study

- **Pages:** 7 total, 6 imported (0 manual, 6 bulk)
- **Desktop:** 60.1% ████████████░░░░░░░░
- **Mobile:** 47.0% █████████░░░░░░░░░░░
- **Average:** 53.5%
- **Tested page:** case-studies_client-focused-partnership-drives-innovation-and-savings
- **Status:** needs-work

### solutions-page

- **Pages:** 41 total, 41 imported (0 manual, 41 bulk)
- **Desktop:** 49.9% ██████████░░░░░░░░░░
- **Mobile:** 19.7% ████░░░░░░░░░░░░░░░░
- **Average:** 34.8%
- **Tested page:** solutions
- **Status:** needs-work

### built-for-audience

- **Pages:** 23 total, 23 imported (0 manual, 23 bulk)
- **Desktop:** 57.6% ████████████░░░░░░░░
- **Mobile:** 31.1% ██████░░░░░░░░░░░░░░
- **Average:** 44.3%
- **Tested page:** built-for
- **Status:** needs-work

### company-utility

- **Pages:** 30 total, 30 imported (0 manual, 30 bulk)
- **Desktop:** 66.1% █████████████░░░░░░░
- **Mobile:** 51.0% ██████████░░░░░░░░░░
- **Average:** 58.6%
- **Tested page:** company
- **Status:** needs-work

## Pages by Readiness

### NEAR — near-ready (225 pages)

| Template | Count | Sample EDS Path |
|----------|------:|-----------------|
| blog-article | 223 | /blog/accelerating-progress-in-healthcare-finance-a-call-to-action |
| homepage | 1 | /index |
| branded-landing | 1 | /let-care-flow |

### WORK — needs-work (142 pages)

| Template | Count | Sample EDS Path |
|----------|------:|-----------------|
| gated-resource | 42 | /white-papers/5-cs-of-payment-integrity |
| solutions-page | 41 | /solutions |
| company-utility | 30 | /company |
| built-for-audience | 23 | /built-for |
| case-study | 6 | /case-studies/client-focused-partnership-drives-innovation-and-savings |

### N/A — not-imported (3 pages)

| EDS Path | Template | Migration |
|----------|----------|-----------|
| /news/zelis-add-investors-reflecting-strong-market-confidence-in-mission | blog-article | none |
| /news/zelis-named-2024-best-in-klas | blog-article | none |
| /case-studies/tpa-eliminated-the-thud-factor-for-clients-2 | case-study | none |

## Methodology

Readiness is determined at the **template level**. One representative page per template
is tested via Playwright screenshot diff (pixelmatch). All pages sharing that template
inherit its readiness status, since style fixes apply template-wide.

**Caveat:** Individual pages may have content-specific issues not captured by template-level
testing. Full per-page regression testing is recommended before launch.

## Recommended Next Steps

Prioritized by proximity to READY threshold and page count:

1. **`blog-article`** — 223 pages at 74.8% avg (need +5.2pp to reach READY)
2. **`branded-landing`** — 1 pages at 73.3% avg (need +6.7pp to reach READY)
3. **`homepage`** — 1 pages at 60.3% avg (need +19.7pp to reach READY)
4. **`company-utility`** — 30 pages at 58.6% avg (need +21.4pp to reach READY)
5. **`case-study`** — 6 pages at 53.5% avg (need +26.5pp to reach READY)
6. **`gated-resource`** — 42 pages at 48.1% avg (need +31.9pp to reach READY)
7. **`built-for-audience`** — 23 pages at 44.3% avg (need +35.7pp to reach READY)
8. **`solutions-page`** — 41 pages at 34.8% avg (need +45.2pp to reach READY)
9. **Import remaining** 3 URLs not yet in content/
10. **Run per-page regression tests** to catch content-specific issues beyond template-level

---
*Generated by `generate-tracker.js` from url-catalog.json + regression-report.md*
