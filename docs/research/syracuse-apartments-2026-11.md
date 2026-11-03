# Syracuse off-campus apartments: rent research (2026-11)

Data file: `syracuse-apartments-2026-11.csv` (51 properties, accessed 2026-11-03). Each row records its source URL. The `source` column says where the price came from, and the `notes` column flags conflicts. The requested header has two extra columns at the end: `source` and `notes`.

## Count by area

| Area | Properties | With a price |
| --- | --- | --- |
| University Hill | 21 | 19 |
| Euclid | 6 | 5 |
| Westcott | 6 | 5 |
| South Campus | 4 | 4 |
| Downtown | 12 | 12 |
| other | 2 | 2 |
| **Total** | **51** | **47** |

Properties with no price: The Marshall (SU-owned since 2021, now 2nd-year university housing), Victory at Olympus (shown as "Ask"), Centennial Hall (ESF, Greystar shows no prices) and Syracuse Quality Living at 215 Cherry St (only a garbled 2018 page).

## Median monthly price by area and basis

`n` counts the properties that have a basis. Medians are taken over the listed low and high values of the "from-to" ranges. They describe the ranges themselves, not a typical unit.

| Area | Basis | n | Median low | Median high |
| --- | --- | --- | --- | --- |
| University Hill | per bed | 7 | $959 | $1,950 |
| University Hill | per unit | 4 | $1,650 | $1,779 (3 highs) |
| University Hill | unclear | 8 | $850 | $1,847 |
| Euclid | per unit | 1 | $1,050 | $1,050 |
| Euclid | unclear (houses, probably per room) | 4 | $675 | $888 |
| Westcott | per unit | 4 | $1,550 | $2,200 |
| Westcott | unclear | 1 | $650 | $1,400 |
| South Campus | per unit | 1 | $1,299 | $1,299 |
| South Campus | unclear | 3 | $687 (2 lows) | $1,099 |
| Downtown | per unit | 12 | $1,550 | $2,775 |
| other | per unit | 1 | $1,015 | $1,925 |
| other | unclear | 1 | $575 | $1,699 |

How to read this:
- **Purpose-built student housing on University Hill** (Theory, Park Point, U Point, Copper Beech Commons, The Coda, Victory) usually starts around **$950–1,230 per bed**. Top-end per-bed prices (studios and 1BRs) reach about **$1,900–2,350**.
- **Euclid and Ackerman houses** run about **$625–1,050 per room**, usually all-inclusive and furnished. Most listings don't say whether the price is per room or per unit, so the basis is marked "unclear".
- **Westcott whole apartments** (2–4BR) run about **$1,550–2,200 per unit**.
- **Downtown** is whole-unit pricing. A studio or 1BR runs about $925–1,700 and the top of the ranges about $2,300–5,700. It is the most consistent data in the set, because it comes from one source.

## Sources and which ones blocked access

| Source | Status | Used for |
| --- | --- | --- |
| housing.offcampus.syr.edu (SU marketplace, College Pads feed) | OK for single listing pages. The `/listing` index page was over 10 MB and could not be read | Most University Hill, Euclid, Westcott and South Campus prices |
| downtownsyracuse.com/housing | OK | All 12 downtown ranges |
| liveherehousing.com/syr | OK, but pages were last updated in 2018 | Lat/lng only (17 rows). Its prices are stale and not used |
| greystar.com | OK, but shows no prices ("contact the community") | Addresses, furnished and fee notes |
| americancampus.com | OK, but floor plans load by JavaScript, so no prices were visible | Unit types |
| **apartments.com** | **Blocked (HTTP 403)** on both the Syracuse search page and the SU off-campus page | Used only through search-engine result snippets. Those rows say "apartments.com (search snippet)" |
| **forrent.com** | **Blocked (403)** | Search snippets only (Campus Prime) |
| **theorysyracuse.prospectportal.com** (official Theory site) | **Blocked (403)** | — |
| downtownsyracuse.com Housing Guide PDFs | 2026 PDF returned 404. 2024 PDF was over 10 MB | — |

No logins, forms or CAPTCHA pages were used. A direct HTML fetch to look for embedded lat/lng JSON was refused by the environment's bot-check rule, so it was not attempted again. None of the readable apartments.com data had coordinates.

## Caveats

1. **SU marketplace unit tables are filler.** Nearly every College Pads listing shows the same "2x2 829 sq ft / 3x3 1,212 / 4x4 1,545 / 4x4.5 TH" table with "Call For Price". Only the "Price From" header range was used, and the unit tables were ignored.
2. **Ranges move, and the basis changes.** Several listings showed different ranges in search snippets than on the live page the same day. For example, 1124 E Colvin showed $2,025–2,175 in a snippet and $725–775 live, and 410 Westcott showed $1,350–2,500 versus $650–1,400. The feed seems to switch between per-unit and per-bed figures, so treat "unclear" rows with care.
3. **"From" prices are base rent.** Greystar and the College Pads listings say mandatory fees are extra: utility admin $81.48, service fee $450 at Copper Beech, and parking $450–700 a year.
4. **Placeholder values were dropped.** UV on Colvin's "$100" low is left blank. The Standard's $400 low is kept but flagged.
5. **Area buckets are my judgment** for edge cases: Tower701 and Campus West (University Hill), 1533 E Genesee and 215 Cherry (Westcott), Clarendon Heights on Ivy Ridge Rd (South Campus). Lark Syracuse (Brighton Pl) and Nob Hill (Lafayette Rd) are "other".
6. **Coordinates are sparse** (17 of 51). They come from LiveHere pages only, and only where the page address matched. Theory's and University Townhouses' LiveHere addresses did not match, so their coordinates were left blank. Victory rows use the 1201 Harrison leasing-office point.
7. **Few managers are named.** College Pads listings hide landlord names. Several Comstock, Westcott and Colvin listings share one phone number, (516) 363-4536, so they probably have the same landlord, but it is unnamed. Big local landlords (Syracuse Quality Living, Kimbrook, Ambassador and others) are under-represented, because their own sites were not found or had no prices.
8. **No per-bed medians for Euclid, Westcott or South Campus.** House listings there rarely state the basis. To compare like with like, divide whole-unit rents by bedroom count yourself. This file does not do that.

## Lowest 5BR (or largest unit) and highest 1BR price

Seven columns were added to the end of the CSV: `low_5br`, `low_5br_type`, `low_5br_basis`, `high_1br`, `high_1br_type`, `high_1br_basis` and `floorplan_source_url`. They are filled for 20 of the 51 properties. When a property has no 5BR, `low_5br` is the lowest price of its largest unit type. When it has no 1BR, `high_1br` is the highest studio price. Prices are monthly. "Snippet" means the figure came from a search-engine result, because the page itself blocked fetching.

| Property | Area | Lowest 5BR / largest unit | Highest 1BR (or studio) | Source |
| --- | --- | --- | --- | --- |
| The Standard at Syracuse | University Hill | $878, 5BR, per bed | $2,772.95, 1BR, per bed | Amber Student (5BR; sold out on the official page), official floor plans (1BR) |
| Theory Syracuse | University Hill | $847, 4BR, per bed | $1,989, 1BR, per bed | apartments.com snippet |
| Park Point Syracuse | University Hill | $1,029, 4BR, per bed | none (no 1BR or studio) | Amber Student |
| U Point Syracuse | University Hill | $899, 4BR, per bed | $1,899, 1BR, per unit | Amber Student |
| Campus West | University Hill | $699, 4BR, per bed | $2,040, 1BR, per unit | apartments.com snippet |
| The Coda | University Hill | $1,099, 3BR, per bed | $2,395, 1BR, per bed | apartments.com snippet (sources conflict) |
| The Marshall / Milton Hall (SU) | University Hill | $1,894.44, 4BR, per bed | $2,052.22, 1BR, per unit | SU rates, converted from per semester |
| UnCommon Syracuse | University Hill | none found | $1,600, 1BR, unclear | Amber Student |
| Copper Beech Commons | University Hill | $950, 4BR, per bed | $2,000, 1BR, per bed | apartments.com snippet |
| Tower701 | University Hill | $1,650, studio, per unit | $1,779, studio, per unit | apartments.com snippet |
| The Laurel | University Hill | $959, 4BR, per bed | $1,989, 1BR, unclear | Amber Student |
| The 505 on Walnut | University Hill | $999, 4BR, unclear | $2,800, 1BR, per bed | apartments.com snippet |
| 827 Euclid Ave | Euclid | $1,050, 1BR, per unit | $1,050, 1BR, per unit | SU marketplace |
| 614 Euclid Ave | Euclid | $625, 8BR, unclear | none | SU marketplace |
| University Village on Colvin | South Campus | $709, 4BR, per bed | none | ApartmentFinder snippet |
| 1124-1126 E Colvin St | South Campus | $725, 3BR, unclear | none | SU marketplace |
| Lark Syracuse | other | $934, 4BR, per bed | $1,699, 1BR, per bed | apartments.com snippet |
| Nob Hill Apartments | other | $1,756, 3BR, per unit | $1,340, 1BR, per unit | ApartmentFinder snippet |
| State Tower | Downtown | none (largest-type price not found) | $2,450, 1BR, per unit | ApartmentFinder snippet |
| The Treasury | Downtown | $2,306, 2BR, per unit | $2,294, 1BR, per unit | Zillow and ApartmentFinder snippets |

Only The Standard has a priced 5BR. The house listings with 5BR (422, 726 and 813 Euclid; 216 Westcott) are single-house rows in the floor-plan file rather than rows in this file.

## Floor-plan file

`syracuse-floorplans-2026-11.csv` has one row per floor plan: 102 rows across 29 properties. Its columns are property, area, plan_name, beds, baths, sqft, price_monthly, price_basis, lease_months, lease_total, price_note, source_url and accessed.

| Area | Rows | Properties |
| --- | --- | --- |
| university-hill | 69 | 11 (The Standard, Theory, The Laurel, Park Point, U Point, Copper Beech, The Coda, Campus West, Tower701, Milton Hall, 505 on Walnut) |
| south-campus | 6 | 3 (SU South Campus Apartments, UV on Colvin, 1124-1126 E Colvin) |
| euclid | 6 | 6 houses |
| westcott | 4 | 4 |
| downtown | 10 | 3 (Pike Block, The Treasury, State Tower) |
| other | 7 | 2 (Lark, Nob Hill) |

Rules used in that file:
- **Lease length and total.** `lease_months` is filled only when the source gives one standard term. Otherwise it is blank, and the term options are listed in `price_note`.
- **The Standard.** The official page says the price is for an 11.5-month (50-week) term paid in 12 equal installments, so `lease_total` = 12 × price. Its FAQ says "12-month Aug-July" instead, which is noted.
- **Which Standard price is used.** Each plan shows two unlabeled all-in figures and a base price. `price_monthly` is the lower all-in figure, because the page says the starting price is base plus mandatory fees. The other two figures are in the note.
- **SU housing.** SU publishes per-student, per-semester rates for 2026-27. They were converted as monthly = 2 × semester ÷ 9. The 9 months come from the Aug-May occupancy term in SU's Terms & Conditions, and `lease_total` = 2 × semester. The rate page does not split prices by complex (Skytop, Slocum Heights, Winding Ridge), so South Campus rows are by bedroom count only, with no baths or square footage.
- **Milton Hall.** The "Modern" studio, 1BR, 2BR and 4BR rates were matched to Milton Hall (the former Marshall). This is my inference: Milton Hall is SU's only apartment building with that unit mix and a bath per bedroom, but the rate page does not name it.
- **Rows with every field filled** (price, lease, beds, baths, sqft): The Standard (20 rows), Copper Beech Commons (4) and The 505 on Walnut (3).
- **Rows with only the lease missing:** Theory, Campus West, Tower701, The Coda, Lark, UV on Colvin's 4x4 plan, 1033 Euclid and 1264 Westcott have price, beds, baths and sqft.

Sources blocked or unusable in this pass:
- **Blocked (403):** apartments.com, forrent.com and theorysyracuse.prospectportal.com, as before, plus zillow.com building pages (new). These were used only through search snippets. victoryatsyracuse.prospectportal.com was not tried because it is on the same platform as the blocked Theory site.
- **Pages that did not help:**
  - victoryatsyracuse.com floor plans say "Call for Details and Rates", and two of its floor-plan URLs returned 404.
  - Greystar pages show no prices.
  - universityliving.com room tables have no prices.
