/* Verimate Hold: shared demo data. Source of truth: WIP/10-15/research/final-model.md (Oct 15 2026).
 * Every amount is an integer number of cents. Format with HOLD.money(cents). Do the math in cents.
 * Pages read from window.HOLD; they never type a dollar amount by hand. Do not edit from a page builder:
 * report problems to the lead instead. HOLD.check() runs on load and console.error()s any sum that is off.
 */
(function (root) {
  'use strict';

  /* ------------------------------------------------------------------ helpers */

  const MINUS = '−';
  const fmt2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmt0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  /* money(cents, opts)
   *   opts.cents  true (default) -> $1,750.00 ; false -> $1,750 (rounds to whole dollars)
   *   opts.sign   false/'auto' (default) -> minus only when negative ; true/'always' -> + or minus ; 'never' -> no sign
   *   opts.k      true -> compact thousands: $30.4K, $227.9K (one decimal) ; opts.k = 0 -> $30K
   * Minus is U+2212, never a hyphen. */
  function money(cents, opts) {
    opts = opts || {};
    if (!Number.isInteger(cents)) throw new TypeError('HOLD.money expects integer cents, got ' + cents);
    const neg = cents < 0, abs = Math.abs(cents);
    let body;
    if (opts.k !== undefined && opts.k !== false) {
      const digits = opts.k === true ? 1 : opts.k;
      const k = abs / 100000;
      body = '$' + k.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + 'K';
    } else {
      body = opts.cents === false ? fmt0.format(Math.round(abs / 100)) : fmt2.format(abs / 100);
    }
    const sign = opts.sign === undefined ? 'auto' : opts.sign;
    if (sign === 'never') return body;
    if (neg && abs !== 0) return MINUS + body;
    if ((sign === true || sign === 'always') && abs !== 0) return '+' + body;
    return body;
  }

  /* moneyParts(cents, opts) -> { sign, symbol, dollars, cents } for hero layouts. */
  function moneyParts(cents, opts) {
    opts = opts || {};
    const s = money(cents, Object.assign({}, opts, { k: false }));
    const m = s.match(/^([+−]?)(\$)([\d,]+)(\.\d\d)?$/);
    return { sign: m[1], symbol: m[2], dollars: m[3], cents: m[4] || '' };
  }

  /* moneyHTML(cents, opts) -> '<span class="amt">$1,750<span class="c">.00</span></span>'
   *   opts.hero true adds class "amt-hero" (cents at 60%, muted). opts.cls adds classes. Other opts as money(). */
  function moneyHTML(cents, opts) {
    opts = opts || {};
    const p = moneyParts(cents, opts);
    const cls = 'amt' + (opts.hero ? ' amt-hero' : '') + (opts.cls ? ' ' + opts.cls : '');
    return '<span class="' + cls + '">' + p.sign + '<span class="cur">' + p.symbol + '</span>' + p.dollars +
      (p.cents ? '<span class="c">' + p.cents + '</span>' : '') + '</span>';
  }

  /* Dates. All demo times are wall-clock Syracuse times written as 'YYYY-MM-DDTHH:MM' and parsed as local,
   * so they print the same on any laptop. Date-only strings are treated as local midnight (not UTC). */
  function parse(v) {
    if (v instanceof Date) return v;
    if (typeof v === 'string' && /^\d{4}-\d\d-\d\d$/.test(v)) v += 'T00:00';
    const d = new Date(v);
    if (isNaN(d)) throw new TypeError('HOLD.date: bad date ' + v);
    return d;
  }
  const DF = {
    short: { month: 'short', day: 'numeric' },                                   // Jan 10
    day:   { weekday: 'short', month: 'short', day: 'numeric' },                 // Sun, Jan 10
    full:  { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' },// Sun, Jan 10, 2027
    long:  { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },  // Sunday, January 10, 2027
    year:  { month: 'short', day: 'numeric', year: 'numeric' },                  // Jan 10, 2027
    month: { month: 'long' },                                                    // January
    time:  { hour: 'numeric', minute: '2-digit' },                               // 3:12 PM
    stamp: { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },                 // Jan 10, 3:12 PM
    dayStamp: { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' } // Sun, Jan 10, 3:12 PM
  };
  const dfCache = {};
  /* date(iso, style='day') -> formatted string. Styles: short, day, full, long, year, month, time, stamp, dayStamp. */
  function date(iso, style) {
    style = style || 'day';
    const o = DF[style];
    if (!o) throw new Error('HOLD.date: unknown style ' + style);
    dfCache[style] = dfCache[style] || new Intl.DateTimeFormat('en-US', o);
    return dfCache[style].format(parse(iso));
  }
  date.parse = parse;
  date.styles = Object.keys(DF);
  /* date.range('2027-01-10','2027-05-20') -> 'Jan 10 – May 20, 2027' (en dash, year once if shared). */
  date.range = function (a, b) {
    const A = parse(a), B = parse(b);
    if (A.getFullYear() === B.getFullYear()) return date(A, 'short') + ' – ' + date(B, 'year');
    return date(A, 'year') + ' – ' + date(B, 'year');
  };
  /* date.addDays(iso, n) -> 'YYYY-MM-DD' */
  date.addDays = function (iso, n) {
    const d = parse(iso); d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  /* date.diffDays(a, b) -> whole days from a to b */
  date.diffDays = function (a, b) {
    const A = parse(a), B = parse(b);
    return Math.round((Date.UTC(B.getFullYear(), B.getMonth(), B.getDate()) - Date.UTC(A.getFullYear(), A.getMonth(), A.getDate())) / 864e5);
  };

  /* ------------------------------------------------------------------ fee rules (section B, C) */

  const fees = {
    listerRate: 0.10,          // 10% of first-month rent actually released, once, after move-in
    renterFee: 0,              // the renter pays $0 for Hold
    premiumMonthly: 999,       // $9.99/mo, free trial until the NY AIV license (RPL 446-a)
    boost: 1900,               // $19, featured 14 days (later, not in projections)
    propertyManagerRate: 0.25, // 25% of first month (year 2+, not in projections)
    card: { rate: 0.029, fixed: 30 },          // card cost, passed through, shown before paying
    achIn: { rate: 0.008, cap: 500 },          // Stripe ACH in: 0.8% capped at $5
    payout: { rate: 0.0025, fixed: 25 },       // Stripe payout: 0.25% + 25 cents
    activeAccount: 200,                        // $2 per active connected account per month
    idCheck: 150,                              // ID + selfie $1.50
    riskReserve: 500,                          // per deal: ACH returns, disputes
    interestToVerimate: 0,                     // GOL 7-103: interest belongs to the renter
    listerFee: function (firstMonthCents) { return Math.round(firstMonthCents * fees.listerRate); },
    cardCost: function (c) { return Math.round(c * fees.card.rate) + fees.card.fixed; },
    achCost: function (c) { return Math.min(Math.round(c * fees.achIn.rate), fees.achIn.cap); },
    payoutCost: function (c) { return Math.round(c * fees.payout.rate) + fees.payout.fixed; },
    premiumCardFee: function () { return Math.round(fees.premiumMonthly * fees.card.rate) + fees.card.fixed; } // 59
  };

  /* ------------------------------------------------------------------ people and the deal */

  const people = {
    renter: {
      key: 'renter', role: 'Renter', name: 'Jamie Walsh', first: 'Jamie', year: "SU '27", school: 'Syracuse University',
      img: 'img/p-1517841905.jpg', alt: 'Jamie Walsh', you: true,
      badges: ['Student verified', 'Face verified']
    },
    lister: {
      key: 'lister', role: 'Lister', name: 'Lena Park', first: 'Lena', year: "SU '28", school: 'Whitman',
      img: 'img/p-1544005313.jpg', alt: 'Lena Park', note: 'Abroad in spring 2027',
      badges: ['Student verified', 'Face verified', 'Owner approved sublet', 'Deposits returned on time'],
      record: {
        before: { onTime: 0, total: 0, label: 'Deposits returned on time', detail: 'No deposits held yet' },
        after:  { onTime: 1, total: 1, label: 'Deposits returned on time 1/1', detail: 'Returned 1 day after move-out' }
      }
    },
    owner: {
      key: 'owner', role: 'Owner', name: 'Comstock Properties LLC', first: 'Comstock Properties',
      note: "The building's landlord. Only approves the sublet in writing; never touches the money."
    }
  };

  const RENT = 87500, DEPOSIT = 87500;
  const PRORATED_MAY = Math.round(RENT * 10 / 31);                  // May 10-19, 10 of 31 days = 28226
  const FEE = fees.listerFee(RENT);                                 // 8750
  const deal = {
    ref: 'VM-27-0114',
    address: '734 Comstock Ave', city: 'Syracuse, NY 13210', unit: 'Room in a 4-bed house', unitShort: 'Room in a 4-bed',
    img: 'img/u-room-sofa.jpg', imgAlt: 'Furnished room at 734 Comstock Ave with a sofa',
    furnished: true, walkMinutes: 6,
    rent: RENT, rentLabel: '$875/mo', deposit: DEPOSIT,
    start: '2027-01-10', end: '2027-05-20', moveIn: '2027-01-10T10:00', moveOut: '2027-05-20',
    datesLabel: 'Jan 10 – May 20, 2027',
    proratedMay: PRORATED_MAY, proratedNote: 'May 10–19, 10 of 31 days',
    totalRent: 4 * RENT + PRORATED_MAY,                              // 378226
    upfront: { firstMonth: RENT, deposit: DEPOSIT, verimateFee: 0, total: RENT + DEPOSIT }, // 175000
    paidBy: 'bank',
    cardCost: fees.cardCost(RENT + DEPOSIT),                          // 5105
    listerFee: FEE,                                                  // 8750
    listerFirstPayout: RENT - FEE,                                   // 78750
    directRent: 3 * RENT + PRORATED_MAY,                             // 290726 (months 2-5, straight to Lena)
    schedule: [
      { due: '2027-01-10', label: 'January rent (first month)', cents: RENT, via: 'hold', fee: FEE },
      { due: '2027-02-10', label: 'February rent', cents: RENT, via: 'direct', fee: 0 },
      { due: '2027-03-10', label: 'March rent', cents: RENT, via: 'direct', fee: 0 },
      { due: '2027-04-10', label: 'April rent', cents: RENT, via: 'direct', fee: 0 },
      { due: '2027-05-10', label: 'May 10–19 rent (10 of 31 days)', cents: PRORATED_MAY, via: 'direct', fee: 0 }
    ],
    deadlines: {
      listed: '2026-11-02T09:20',
      booked: '2026-12-01T14:14',
      achSettles: '2026-12-07',            // T+4 business days; nothing released before this
      bankCutoff: '2027-01-01',            // bank bookings close 5 business days before move-in
      moveIn: '2027-01-10T10:00',
      autoRelease: '2027-01-12T10:00',     // 48 h after move-in
      moveInConfirmed: '2027-01-10T15:12',
      lenaBankArrives: '2027-01-12',       // 1-2 business days
      walkthrough: ['2027-05-06', '2027-05-13'], // GOL 7-108(1-a)(d)
      movedOut: '2027-05-20T11:30',        // Day 0
      returnBy: '2027-05-27',              // Day 7, Claim button disappears after this
      autoReturn: '2027-05-28',            // Day 8, full deposit auto-returns
      nyDeadline: '2027-06-03',            // Day 14, GOL 7-108 hard stop
      returned: '2027-05-21T09:40',
      jamieBankArrives: ['2027-05-24', '2027-05-25']
    },
    reminders: ['Day 3', 'Day 6']
  };

  /* ------------------------------------------------------------------ pricing (section B) */

  const pricing = [
    { who: 'Lister', what: 'Listing', when: 'Anytime', cents: 0, amount: '$0', note: 'Listing is free.' },
    { who: 'Lister', what: 'Lister fee', when: 'Taken out of the first rent release, after the renter taps All good or the 48 h auto-release',
      cents: FEE, amount: '10% of the first month, once', note: '$87.50 on 734 Comstock, $80 on an average deal. $0 if move-in fails.', revenue: true },
    { who: 'Renter', what: 'Verimate Hold (rent hold, deposit hold, one-tap return, move-in and move-out check)', when: 'Every deal',
      cents: 0, amount: '$0', note: 'Hold is free on every deal.' },
    { who: 'Renter', what: 'Premium (optional): 48 h early access, roommate match, unlimited agent checks, text and email alerts', when: 'Monthly',
      cents: fees.premiumMonthly, amount: '$9.99/mo', note: 'Free trial at launch. Never gates Hold or verification.', revenue: true },
    { who: 'Payer, by choice', what: 'Card instead of bank', when: 'At booking',
      cents: deal.cardCost, amount: '2.9% + 30¢', note: '$51.05 on $1,750.00, shown before paying. Bank (ACH) is free and the default. Pass-through, not revenue.' },
    { who: 'Lister (later)', what: 'Boost: featured for 14 days', when: 'Upfront', cents: fees.boost, amount: '$19', note: 'Not in projections.', later: true },
    { who: 'Property manager (year 2+)', what: 'Same success fee, larger', when: 'After move-in', cents: null, amount: '25% of the first month', note: 'Not in projections.', later: true },
    { who: 'Nobody', what: 'Interest on held money', when: '—', cents: 0, amount: '$0', note: 'By NY GOL 7-103 it belongs to the renter.' }
  ];

  /* Why 10% of one month: same room, $875/mo. Text amounts are ranges from the model; cents is a single comparable figure when one exists. */
  const comparison = [
    { option: 'Leasing agent', lister: '$438–875', listerNote: '50–100% of a month', listerCents: [43800, 87500], renter: '$0' },
    { option: 'Airbnb host-only fee 15.5%', lister: 'about $586', listerCents: 58600, renter: '$0' },
    { option: 'HousingAnywhere (EU)', lister: 'about $219', listerCents: 21900, renter: '$219–350' },
    { option: 'Facebook or Snapchat', lister: '$0', listerCents: 0, renter: '$0, and no protection' },
    { option: 'Room stays empty', lister: '$875 every month', listerCents: RENT, renter: '—' },
    { option: 'Verimate Hold', lister: '$87.50, once, after move-in', listerCents: FEE, renter: '$0', us: true }
  ];

  /* ------------------------------------------------------------------ worked flow, 9 steps (section C) */

  // Verimate cost lines, in the order they happen.
  const C = {
    idLena:   { label: 'ID and face check, Lena', cents: fees.idCheck },
    idJamie:  { label: 'ID and face check, Jamie', cents: fees.idCheck },
    ach:      { label: 'Stripe ACH in on $1,750.00 (0.8%, capped at $5)', cents: fees.achCost(RENT + DEPOSIT) },
    payRent:  { label: 'Stripe payout of $787.50 to Lena (0.25% + 25¢)', cents: fees.payoutCost(RENT - FEE) },
    acctLena: { label: 'Stripe active account, Lena', cents: fees.activeAccount },
    payDep:   { label: 'Stripe payout of $875.00 to Jamie (0.25% + 25¢)', cents: fees.payoutCost(DEPOSIT) },
    acctJamie:{ label: 'Stripe active account, Jamie', cents: fees.activeAccount },
    reserve:  { label: 'Risk reserve (ACH returns, disputes)', cents: fees.riskReserve }
  };

  const flow = [
    { n: 1, at: '2026-11-02T09:20', title: 'Lena lists for free',
      detail: "Student, ID and face check. She uploads her lease and the owner's written OK, which earns the Owner approved sublet badge.",
      screen: "You'll receive $787.50 of your first $875.00",
      renter: 0, held: 0, lister: 0, revenue: 0, costs: [C.idLena] },
    { n: 2, at: '2026-12-01T14:14', title: 'Jamie verifies and books',
      detail: 'Pay sheet: first month $875.00 + deposit $875.00 + Verimate fee $0.00 = $1,750.00, paid by bank.',
      screen: "Lena sees: Booked, $1,750.00 held, you can't withdraw it",
      renter: -(RENT + DEPOSIT), held: RENT + DEPOSIT, lister: 0, revenue: 0, costs: [C.idJamie, C.ach] },
    { n: 3, at: '2026-12-07', title: 'Bank payment settles',
      detail: 'ACH settles in 4 business days. Nothing is ever released before this.',
      renter: 0, held: RENT + DEPOSIT, lister: 0, revenue: 0, costs: [] },
    { n: 4, at: '2027-01-10T10:00', title: 'Move-in, 48 h window opens',
      detail: "Room photos signed by both (New York's move-in condition record). Auto-release Tue, Jan 12 at 10:00 AM.",
      renter: 0, held: RENT + DEPOSIT, lister: 0, revenue: 0, costs: [] },
    { n: 5, at: '2027-01-10T15:12', title: 'Jamie taps All good',
      detail: 'Receipt: rent $875.00, Verimate fee −$87.50, Lena receives $787.50 (in her bank in 1–2 business days).',
      renter: 0, held: DEPOSIT, lister: RENT - FEE, revenue: FEE, costs: [C.payRent, C.acctLena] },
    { n: 6, at: '2027-02-10', atEnd: '2027-05-10', title: 'Rent for February to May goes straight to Lena',
      detail: '$875.00 × 3 + $282.26 = $2,907.26. The app only sends reminders. No fee on months 2–5.',
      renter: -(3 * RENT + PRORATED_MAY), held: DEPOSIT, lister: 3 * RENT + PRORATED_MAY, revenue: 0, costs: [] },
    { n: 7, at: '2027-05-06', atEnd: '2027-05-13', title: 'Pre-move-out walkthrough',
      detail: 'Offered under GOL 7-108(1-a)(d). Lena flags nothing.',
      renter: 0, held: DEPOSIT, lister: 0, revenue: 0, costs: [] },
    { n: 8, at: '2027-05-20T11:30', title: "Jamie taps I've moved out",
      detail: 'Photos attached. Day 0 of 14. Lena sees: return by May 27, auto-returns May 28, NY deadline Jun 3.',
      renter: 0, held: DEPOSIT, lister: 0, revenue: 0, costs: [] },
    { n: 9, at: '2027-05-21T09:40', title: 'Lena taps Return $875.00',
      detail: "Arrives in Jamie's bank Mon, May 24 to Tue, May 25. Lena's profile: Deposits returned on time 1/1.",
      renter: DEPOSIT, held: 0, lister: 0, revenue: 0, costs: [C.payDep, C.acctJamie] }
  ];
  // held is the balance after the step; renter, lister, revenue are the changes in that step.

  /* ------------------------------------------------------------------ totals (section C) */

  const thisDealCosts = [C.idLena, C.idJamie, C.ach, C.payRent, C.acctLena, C.payDep, C.acctJamie, C.reserve];
  const sum = (arr, f) => arr.reduce((t, x) => t + (f ? f(x) : x), 0);
  const totals = {
    renterPaidIn: RENT + DEPOSIT + 3 * RENT + PRORATED_MAY,          // 465726
    renterGotBack: DEPOSIT,                                           // 87500
    renterNet: 4 * RENT + PRORATED_MAY,                               // 378226 = rent only
    renterFees: 0,
    listerReceived: (RENT - FEE) + (3 * RENT + PRORATED_MAY),         // 369476
    listerPaid: FEE,                                                  // 8750
    listerPaidPctOfLease: '2.3%',                                     // 8750 / 378226
    listerPaidDaysOfRent: 'about 3 days of rent',
    verimateRevenue: FEE,
    stripe: C.ach.cents + C.payRent.cents + C.payDep.cents + C.acctLena.cents + C.acctJamie.cents, // 1366
    stripePayouts: C.payRent.cents + C.payDep.cents,                  // 466
    stripeAccounts: C.acctLena.cents + C.acctJamie.cents,             // 400
    idChecks: C.idLena.cents + C.idJamie.cents,                       // 300
    riskReserve: C.reserve.cents,                                     // 500
    verimateCosts: sum(thisDealCosts, x => x.cents),                  // 2166
    verimateNet: FEE - sum(thisDealCosts, x => x.cents),              // 6584
    verimateMargin: '75%'
  };

  const endings = [
    { key: 'fake', title: 'Fake room or no keys', text: 'Jamie taps Report a problem within 48 h and gets the full $1,750.00 back. Lena pays $0. Verimate earns $0 and loses about $8 (ACH and ID checks).', renterBack: RENT + DEPOSIT, verimateEarned: 0, verimateLoss: C.ach.cents + C.idLena.cents + C.idJamie.cents },
    { key: 'damage', title: 'Damage', text: 'By May 27 Lena files Broken blind −$60.00 with a photo and an estimate. $815.00 goes back to Jamie at once; the $60.00 is decided by Day 14.', renterBack: DEPOSIT - 6000, held: 6000 },
    { key: 'silent', title: 'Lena does nothing', text: 'The full $875.00 auto-returns on Fri, May 28 (Day 8).', renterBack: DEPOSIT, on: '2027-05-28' },
    { key: 'card', title: 'Card instead of bank', text: "Jamie sees +$51.05 card cost before paying. Verimate's numbers don't change.", cardCost: deal.cardCost }
  ];

  /* ------------------------------------------------------------------ live demo beats (section H) */

  // Verimate ledger rows. kind: 'fee' (revenue), 'nofee' (a payment Verimate charges $0 on), 'cost' (negative).
  const L = {
    idLena:   { id: 'id-lena',   at: '2026-11-02T09:20', label: 'ID and face check, Lena',  cents: -C.idLena.cents, kind: 'cost' },
    idJamie:  { id: 'id-jamie',  at: '2026-12-01T11:02', label: 'ID and face check, Jamie', cents: -C.idJamie.cents, kind: 'cost' },
    ach:      { id: 'ach-in',    at: '2026-12-01T14:14', label: 'Stripe ACH in on $1,750.00', cents: -C.ach.cents, kind: 'cost' },
    fee:      { id: 'fee-jan',   at: '2027-01-10T15:12', label: '734 Comstock lister fee', note: '10% of $875.00', cents: FEE, kind: 'fee' },
    payRent:  { id: 'pay-rent',  at: '2027-01-10T15:12', label: 'Stripe payout of $787.50 to Lena', cents: -C.payRent.cents, kind: 'cost' },
    acctLena: { id: 'acct-lena', at: '2027-01-10T15:12', label: 'Stripe active account, Lena', cents: -C.acctLena.cents, kind: 'cost' },
    feb:      { id: 'fee-feb',   at: '2027-02-10T09:00', label: 'February rent to Lena, $875.00', note: 'Verimate fee $0.00', cents: 0, kind: 'nofee' },
    mar:      { id: 'fee-mar',   at: '2027-03-10T09:00', label: 'March rent to Lena, $875.00', note: 'Verimate fee $0.00', cents: 0, kind: 'nofee' },
    apr:      { id: 'fee-apr',   at: '2027-04-10T09:00', label: 'April rent to Lena, $875.00', note: 'Verimate fee $0.00', cents: 0, kind: 'nofee' },
    may:      { id: 'fee-may',   at: '2027-05-10T09:00', label: 'May 10–19 rent to Lena, $282.26', note: 'Verimate fee $0.00', cents: 0, kind: 'nofee' },
    payDep:   { id: 'pay-dep',   at: '2027-05-21T09:40', label: 'Stripe payout of $875.00 to Jamie', cents: -C.payDep.cents, kind: 'cost' },
    acctJamie:{ id: 'acct-jamie',at: '2027-05-21T09:40', label: 'Stripe active account, Jamie', cents: -C.acctJamie.cents, kind: 'cost' },
    reserve:  { id: 'reserve',   at: '2027-05-21T09:40', label: 'Risk reserve (ACH returns, disputes)', cents: -C.reserve.cents, kind: 'cost' },
    noFee:    { id: 'fee-none',  at: '2027-01-12T16:20', label: '734 Comstock lister fee', note: 'No move-in, no fee', cents: 0, kind: 'nofee' }
  };

  function beat(n, o) {
    const rows = o.ledgerRows;
    const b = Object.assign({ n: n, id: 'beat-' + n, hash: '#beat-' + n }, o);
    b.dateLabel = o.dateLabel || date(o.at, 'full');
    b.timeLabel = o.timeLabel !== undefined ? o.timeLabel : date(o.at, 'time');
    b.renterNet = b.renterPaid - b.renterBack;
    b.verimateNet = b.verimateEarned - b.verimateCosts;
    b.ledgerRows = rows.slice();
    return b;
  }
  const r1 = [L.idLena], r2 = r1.concat(L.idJamie), r3 = r2.concat(L.ach),
        r6 = r3.concat(L.fee, L.payRent, L.acctLena), r7 = r6.concat(L.feb, L.mar, L.apr, L.may),
        r9 = r7.concat(L.payDep, L.acctJamie), r10 = r9.concat(L.reserve);
  const COST3 = C.idLena.cents + C.idJamie.cents + C.ach.cents;          // 800
  const COST6 = COST3 + C.payRent.cents + C.acctLena.cents;               // 1222
  const COST9 = COST6 + C.payDep.cents + C.acctJamie.cents;               // 1666
  const UP = RENT + DEPOSIT;

  const beats = [
    beat(1, { at: '2026-11-02T09:20', title: 'Lena lists 734 Comstock', press: 'Page Down, then Publish',
      jamie: null, lena: ['List 734 Comstock', 'Listing is free', '10% of the first month ($87.50), only after move-in', "You'll receive $787.50 of your first $875.00"],
      say: 'Listing is free. Lena pays only if someone actually moves in.',
      renterPaid: 0, renterBack: 0, held: 0, listerReceived: 0, verimateEarned: 0, verimateCosts: C.idLena.cents, ledgerRows: r1 }),
    beat(2, { at: '2026-12-01T11:02', title: 'Jamie sees verified people', press: 'Tap Book with Hold',
      jamie: ['734 Comstock Ave, $875/mo', 'Student verified', 'Face verified', 'Owner approved sublet', 'Deposits returned on time'], lena: null,
      say: 'Jamie only sees verified people and approved sublets.',
      renterPaid: 0, renterBack: 0, held: 0, listerReceived: 0, verimateEarned: 0, verimateCosts: C.idLena.cents + C.idJamie.cents, ledgerRows: r2 }),
    beat(3, { at: '2026-12-01T14:14', title: 'Jamie pays $1,750.00 into the hold', press: 'Tap Pay $1,750.00',
      jamie: ['First month $875.00', 'Deposit $875.00', 'Verimate fee $0.00', 'Total $1,750.00', 'Bank (free)'],
      lena: ['Booked', '$1,750.00 held', "You can't withdraw it"],
      say: 'The money goes to the hold, not to a stranger.',
      renterPaid: UP, renterBack: 0, held: UP, listerReceived: 0, verimateEarned: 0, verimateCosts: COST3, ledgerRows: r3 }),
    beat(4, { at: '2026-12-01T14:16', title: 'Where is my money?', press: 'Tap the tracker',
      jamie: ['$1,750.00 held at Stripe for Verimate', "Lena can't touch it", "Verimate can't spend it"], lena: null,
      tracker: ['Paid', 'Held by Verimate', 'Released after move-in'],
      say: 'Anyone, even a parent, can see exactly where the money sits.',
      renterPaid: UP, renterBack: 0, held: UP, listerReceived: 0, verimateEarned: 0, verimateCosts: COST3, ledgerRows: r3 }),
    beat(5, { at: '2027-01-10T10:00', title: 'Move-in check, 48 h', press: 'Point at the timer',
      jamie: ['3 room photos checked', '47:59:59', 'Auto-releases if you say nothing'], buttons: ['All good', 'Report a problem'],
      timer: { start: '2027-01-10T10:00', end: '2027-01-12T10:00', display: '47:59:59' },
      lena: ['Waiting on Jamie to confirm move-in', 'Auto-releases Tue, Jan 12 at 10:00 AM'],
      say: 'If Jamie says nothing, Lena still gets paid in 48 hours.',
      renterPaid: UP, renterBack: 0, held: UP, listerReceived: 0, verimateEarned: 0, verimateCosts: COST3, ledgerRows: r3 }),
    beat(6, { at: '2027-01-10T15:12', title: 'Jamie taps All good, rent released', press: 'Tap All good',
      jamie: ['Rent released to Lena', 'Deposit $875.00 still held by Verimate'],
      lena: ['Rent $875.00', 'Verimate fee −$87.50', 'You receive $787.50'],
      receipt: [{ label: 'Rent', cents: RENT }, { label: 'Verimate fee (10%)', cents: -FEE }, { label: 'You receive', cents: RENT - FEE, total: true }],
      say: 'That $87.50 is our business model.',
      renterPaid: UP, renterBack: 0, held: DEPOSIT, listerReceived: RENT - FEE, verimateEarned: FEE, verimateCosts: COST6, ledgerRows: r6 }),
    beat(7, { at: '2027-05-10T09:00', dateLabel: 'Feb 10 – May 10, 2027', timeLabel: '', title: 'February to May rent, no fee', press: 'Page Down',
      jamie: ['Rent paid straight to Lena'], lena: ['February rent $875.00, Verimate fee $0.00', 'March rent $875.00, Verimate fee $0.00', 'April rent $875.00, Verimate fee $0.00', 'May 10–19 rent $282.26, Verimate fee $0.00'],
      ticks: ['2027-02-10', '2027-03-10', '2027-04-10', '2027-05-10'],
      say: 'We charge once, not every month.',
      renterPaid: UP + 3 * RENT + PRORATED_MAY, renterBack: 0, held: DEPOSIT, listerReceived: (RENT - FEE) + 3 * RENT + PRORATED_MAY, verimateEarned: FEE, verimateCosts: COST6, ledgerRows: r7 }),
    beat(8, { at: '2027-05-20T11:30', title: "Jamie taps I've moved out", press: "Tap I've moved out",
      jamie: ['Day 0 of 14, New York law', 'Auto-return May 28', 'Deadline Jun 3'], lena: ['Day 0 of 14, New York law', 'Return by May 27', 'Auto-returns May 28', 'NY deadline Jun 3'],
      say: "New York gives landlords 14 days. On Verimate it's one tap.",
      renterPaid: UP + 3 * RENT + PRORATED_MAY, renterBack: 0, held: DEPOSIT, listerReceived: (RENT - FEE) + 3 * RENT + PRORATED_MAY, verimateEarned: FEE, verimateCosts: COST6, ledgerRows: r7 }),
    beat(9, { at: '2027-05-21T09:40', title: 'Lena taps Return $875.00', press: 'Tap Return $875.00',
      jamie: ['Deposit returned', '$875.00', '1 day after move-out', 'Share'], lena: ['Deposit returned', 'Deposits returned on time 1/1'], buttons: ['Return $875.00', 'Claim deductions'],
      say: "The deposit never sat with Lena, and it's back the next day.",
      renterPaid: UP + 3 * RENT + PRORATED_MAY, renterBack: DEPOSIT, held: 0, listerReceived: (RENT - FEE) + 3 * RENT + PRORATED_MAY, verimateEarned: FEE, verimateCosts: COST9, ledgerRows: r9 }),
    beat(10, { at: '2027-05-21T09:40', dateLabel: 'Deal closed, May 21, 2027', timeLabel: '', title: 'What this deal earned, and year 1', press: 'Page Down',
      card: [
        { label: "Jamie's fees", cents: 0 },
        { label: 'Lena paid', cents: FEE, note: '2.3% of her lease' },
        { label: 'Verimate costs', cents: sum(thisDealCosts, x => x.cents) },
        { label: 'Verimate kept', cents: FEE - sum(thisDealCosts, x => x.cents), total: true }
      ],
      run: { fromDeals: 1, toDeals: 280, perDeal: 8000, listerFees: 280 * 8000, premium: 200 * 4 * fees.premiumMonthly, total: 280 * 8000 + 200 * 4 * fees.premiumMonthly, label: 'Year 1, Syracuse' },
      say: "280 Syracuse subleases is $30K in year one, and every campus repeats it.",
      renterPaid: UP + 3 * RENT + PRORATED_MAY, renterBack: DEPOSIT, held: 0, listerReceived: (RENT - FEE) + 3 * RENT + PRORATED_MAY, verimateEarned: FEE, verimateCosts: COST9 + C.reserve.cents, ledgerRows: r10 })
  ];

  /* Branches. Each state has the same money-bar keys as a beat. */
  function state(o) {
    const s = Object.assign({}, o);
    s.dateLabel = o.dateLabel || date(o.at, 'full');
    s.timeLabel = o.timeLabel !== undefined ? o.timeLabel : date(o.at, 'time');
    s.renterNet = s.renterPaid - s.renterBack;
    s.verimateNet = s.verimateEarned - s.verimateCosts;
    return s;
  }
  const branches = {
    whatIf: {
      key: 'what-if', hash: '#what-if', keyHint: 'B', from: 'beat-5',
      title: 'What if the room is not as listed?',
      reason: 'No access',
      reasons: ['Not real or not as listed', 'No access', 'Unsafe', 'Lister not allowed to sublet'],
      say: "No move-in, no fee. A scammer can't get paid here.",
      states: [
        state({ id: 'frozen', at: '2027-01-10T11:05', title: 'Jamie taps Report a problem, No access', status: 'frozen',
          jamie: ['$1,750.00 frozen', 'Lena has 24 h to answer', 'Decision in 3 business days'],
          lena: ['Problem reported: No access', 'Answer by Mon, Jan 11 at 11:05 AM'],
          deadlines: { listerAnswer: '2027-01-11T11:05', decision: '2027-01-13' },
          renterPaid: UP, renterBack: 0, held: UP, listerReceived: 0, verimateEarned: 0, verimateCosts: COST3, ledgerRows: r3.slice() }),
        state({ id: 'refunded', at: '2027-01-12T16:20', title: 'Refund $1,750.00', status: 'returned', button: 'Refund $1,750.00', result: 'Refunded',
          jamie: ['$1,750.00 returned to you', 'Nothing was paid out'], lena: ['Booking cancelled', 'You paid $0.00'],
          renterPaid: UP, renterBack: UP, held: 0, listerReceived: 0, verimateEarned: 0, verimateCosts: COST3, ledgerRows: r3.concat(L.noFee) })
      ]
    },
    damage: {
      key: 'damage', hash: '#damage', keyHint: 'D', from: 'beat-9',
      title: 'Lena claims a deduction instead',
      claim: { label: 'Broken blind', cents: 6000, evidence: ['Photo', 'Repair estimate'], reason: 'Damage beyond normal wear' },
      say: 'The part nobody disputes comes back the same minute.',
      states: [
        state({ id: 'claimed', at: '2027-05-21T09:40', title: 'Lena files Broken blind −$60.00', status: 'review',
          jamie: ['$815.00 returned to you now', '$60.00 under review', 'Decided by Jun 3'],
          lena: ['Claim filed: Broken blind −$60.00', 'Photo and estimate attached', 'Jamie has 72 h to accept or dispute'],
          deadlines: { renterReply: '2027-05-24T09:40', decidedBy: '2027-06-03' },
          renterPaid: UP + 3 * RENT + PRORATED_MAY, renterBack: DEPOSIT - 6000, held: 6000,
          listerReceived: (RENT - FEE) + 3 * RENT + PRORATED_MAY, verimateEarned: FEE,
          verimateCosts: COST6 + fees.payoutCost(DEPOSIT - 6000) + C.acctJamie.cents,
          ledgerRows: r7.concat(
            { id: 'pay-dep-part', at: '2027-05-21T09:40', label: 'Stripe payout of $815.00 to Jamie', cents: -fees.payoutCost(DEPOSIT - 6000), kind: 'cost' },
            L.acctJamie) })
      ]
    }
  };

  /* Money activity, for trackers and logs (book.html, lister.html). cents is signed from the actor's own view where noted. */
  const activity = [
    { at: '2026-11-02T09:20', who: 'lister', text: 'Lena listed 734 Comstock Ave', cents: null, state: null },
    { at: '2026-12-01T14:14', who: 'renter', text: 'You paid first month and deposit by bank', cents: UP, state: 'held' },
    { at: '2026-12-07T09:00', who: 'system', text: 'Bank payment settled', cents: UP, state: 'held' },
    { at: '2027-01-10T10:00', who: 'system', text: 'Move-in window opened, auto-release Tue, Jan 12 at 10:00 AM', cents: RENT, state: 'held' },
    { at: '2027-01-10T15:12', who: 'renter', text: 'You tapped All good', cents: RENT, state: 'released' },
    { at: '2027-01-10T15:12', who: 'system', text: 'Rent released to Lena, $787.50 after the 10% lister fee', cents: RENT - FEE, state: 'released' },
    { at: '2027-02-10T09:00', who: 'renter', text: 'February rent paid to Lena', cents: RENT, state: 'released' },
    { at: '2027-03-10T09:00', who: 'renter', text: 'March rent paid to Lena', cents: RENT, state: 'released' },
    { at: '2027-04-10T09:00', who: 'renter', text: 'April rent paid to Lena', cents: RENT, state: 'released' },
    { at: '2027-05-10T09:00', who: 'renter', text: 'May 10–19 rent paid to Lena', cents: PRORATED_MAY, state: 'released' },
    { at: '2027-05-20T11:30', who: 'renter', text: "You tapped I've moved out. Day 0 of 14", cents: DEPOSIT, state: 'held' },
    { at: '2027-05-21T09:40', who: 'lister', text: 'Lena tapped Return $875.00', cents: DEPOSIT, state: 'returned' }
  ];

  /* ------------------------------------------------------------------ unit economics (section C, F) */

  const unit = {
    thisDeal: {
      label: '734 Comstock Ave', rent: RENT, months: '4 months and 10 days', paidBy: 'bank',
      lines: [
        { label: 'Lister fee, 10% of $875.00', cents: FEE },
        { label: 'Stripe ACH in', cents: -C.ach.cents },
        { label: 'Stripe payouts ($2.22 + $2.44)', cents: -(C.payRent.cents + C.payDep.cents) },
        { label: 'Stripe active accounts (2 × $2.00)', cents: -(C.acctLena.cents + C.acctJamie.cents) },
        { label: 'ID checks (2 × $1.50)', cents: -(C.idLena.cents + C.idJamie.cents) },
        { label: 'Risk reserve (ACH returns, disputes)', cents: -C.reserve.cents }
      ],
      revenue: FEE, costs: totals.verimateCosts, net: totals.verimateNet, margin: '75%'
    },
    average: {
      label: 'Average deal', rent: 80000, months: 4, deposit: 80000, paidBy: 'bank', note: "Deck's average: $800/mo, 4 months, $800 deposit",
      lines: [
        { label: 'Lister fee, 10% of $800.00', cents: fees.listerFee(80000) },
        { label: 'ACH in on $1,600.00 (capped)', cents: -fees.achCost(160000) },
        { label: 'Rent payout of $720.00', cents: -fees.payoutCost(72000) },
        { label: 'Deposit payout of $800.00', cents: -fees.payoutCost(80000) },
        { label: 'Active accounts (lister and renter)', cents: -2 * fees.activeAccount },
        { label: 'ID checks (2 × $1.50)', cents: -2 * fees.idCheck },
        { label: 'Risk reserve', cents: -fees.riskReserve }
      ],
      revenue: fees.listerFee(80000), deckHad: 1200, margin: '73%',
      takeRate: '2.5% of lease value (10% of one month ÷ 4 months)'
    }
  };
  unit.average.costs = -sum(unit.average.lines.slice(1), x => x.cents);   // 2130
  unit.average.net = sum(unit.average.lines, x => x.cents);               // 5870

  /* ------------------------------------------------------------------ year 1 and 3 years (section F) */

  const AVG_COST = unit.average.costs, AVG_FEE = unit.average.revenue;
  const PREM_CARD = fees.premiumCardFee();
  /* yearModel({ deals=280, premium=true, members=200, months=4 }) -> every line of the year-1 table, in cents.
   * Marketing = ambassador $5,000 + flyers/ads $2,000 + referrals $10 per deal on average. Fixed = legal $5,000 + hosting $2,400.
   * breakEvenDeals is rounded to the nearest deal, which matches the model's "about 141" (296 without Premium). */
  function yearModel(o) {
    o = Object.assign({ deals: 280, premium: true, members: 200, months: 4 }, o || {});
    const d = o.deals;
    const listerFees = d * AVG_FEE;
    const subs = o.premium ? o.members * o.months : 0;
    const premium = subs * fees.premiumMonthly;
    const revenue = listerFees + premium;
    const dealCosts = d * AVG_COST;
    const premiumCardFees = subs * PREM_CARD;
    const contribution = revenue - dealCosts - premiumCardFees;
    const marketing = 500000 + 200000 + 1000 * d;
    const fixed = 500000 + 240000;
    const result = contribution - marketing - fixed;
    const perDeal = AVG_FEE - AVG_COST - 1000;                     // 4870
    const breakEvenDeals = Math.round((500000 + 200000 + fixed - (premium - premiumCardFees)) / perDeal);
    return { deals: d, premiumOn: !!o.premium, subscriptions: subs, listerFees, premium, revenue, dealCosts, premiumCardFees,
      contribution, marketing, fixed, result, breakEvenDeals,
      facilitated: d * 320000, heldAtBooking: d * 160000, cac: Math.round(marketing / d) };
  }
  const y1 = yearModel();
  const year1 = {
    label: 'Year 1, Syracuse', period: 'Aug 2027 – Jul 2028', periodNote: 'First 12 paid months: fall 2027, spring 2028, summer 2028',
    beta: { label: 'Summer 2027 beta', deals: 60, costs: 60 * AVG_COST, note: 'Free, as the deck says. Costs about $1.3K and earns the first returned-on-time badges.' },
    assumptions: [
      { label: 'Deals', value: '280 = 10% of about 2,800 Syracuse subleases a year', source: 'Deck 15, 25' },
      { label: 'Season mix', value: 'About 50% spring, 25% fall, 25% summer', source: 'Spring abroad peak (2–3× fall)' },
      { label: 'Rent, term, deposit', value: '$800, 4 months, $800', source: 'Deck 24, 25' },
      { label: 'Premium', value: '200 members × 4 months × $9.99', source: 'Deck 25 (needs license by Aug 2027)' },
      { label: 'Marketing', value: 'Ambassador $5,000; referral $10 + $10 on half the deals $2,800; flyers and ads $2,000', source: 'Estimate' },
      { label: 'Fixed', value: 'NY legal opinion $5,000; hosting and tools $2,400', source: 'Estimate' }
    ],
    lines: [
      { label: 'Lister fees, 280 × $80', cents: y1.listerFees },
      { label: 'Premium, 200 × 4 × $9.99', cents: y1.premium },
      { label: 'Revenue', cents: y1.revenue, total: true },
      { label: 'Deal costs, 280 × $21.30', cents: -y1.dealCosts },
      { label: 'Premium card fees, 800 × $0.59', cents: -y1.premiumCardFees },
      { label: 'Contribution', cents: y1.contribution, total: true },
      { label: 'Marketing', cents: -y1.marketing },
      { label: 'Fixed', cents: -y1.fixed },
      { label: 'Result before team pay', cents: y1.result, total: true }
    ],
    revenue: y1.revenue, contribution: y1.contribution, result: y1.result,
    facilitated: y1.facilitated,             // $896K of rent
    heldAtBooking: y1.heldAtBooking,         // $448K
    peakDepositsHeld: 140 * 80000,           // $112K, spring
    cac: y1.cac,                             // $35 per completed deal
    cacCeiling: unit.average.net,            // one deal's $58.70
    breakEvenWithPremium: y1.breakEvenDeals,                         // 141
    breakEvenWithoutPremium: yearModel({ premium: false }).breakEvenDeals, // 296
    downside: { label: 'No paid Premium in year 1, and a broker of record takes 20% of fees', revenue: Math.round(y1.listerFees * 0.8), deckHad: 1400000,
      note: 'Still above the deck’s $14K. That case needs the prize money to cover the legal opinion.' },
    ruleOfThumb: { deals: 100, revenue: 100 * AVG_FEE }               // every 100 deals = $8,000
  };

  const threeYear = [
    { year: 1, campuses: 1, campusLabel: 'Syracuse', share: '10%', deals: 280, members: 200, listerFees: 280 * AVG_FEE, premium: 200 * 4 * fees.premiumMonthly, deckHad: 1400000 },
    { year: 2, campuses: 5, campusLabel: '5 (Upstate NY first: same deposit law)', share: '15%', deals: 2100, members: 1500, listerFees: 2100 * AVG_FEE, premium: 1500 * 4 * fees.premiumMonthly, deckHad: 10200000 },
    { year: 3, campuses: 10, campusLabel: '10', share: '20%', deals: 5600, members: 4000, listerFees: 5600 * AVG_FEE, premium: 4000 * 4 * fees.premiumMonthly, deckHad: 27200000 }
  ].map(r => Object.assign(r, { revenue: r.listerFees + r.premium }));

  const upside = [
    'Property-manager plan (25% of the first month on 12-month leases)',
    '$19 Boost',
    'A 10% vs 15% price test in Q1 2027 (deck slide 19 already plans a price test)'
  ];
  const nationalCeiling = { rent: 200000000000, rate: '2.5%', revenue: 5000000000, label: 'About $2B of student sublease rent × 2.5% ≈ $50M a year' };

  /* ------------------------------------------------------------------ words (sections A, D, E, G) */

  const promise = {
    name: 'Verimate Hold',
    renter: "Your rent waits until you're in. Your deposit comes back in one tap.",
    lister: 'List free. Pay 10% of one month, only after your renter moves in.',
    money: 'Stripe holds it, our rules release it, New York law is the timer.'
  };

  const vocab = {
    feature: 'Verimate Hold',
    states: { held: 'Held by Verimate', released: 'Released', returned: 'Returned', frozen: 'Frozen', needs: 'Needs you' },
    roles: { renter: 'Renter', lister: 'Lister', owner: 'Owner' },
    buttons: { book: 'Book with Hold', pay: 'Pay $1,750.00', allGood: 'All good', report: 'Report a problem', movedOut: "I've moved out",
      returnDeposit: 'Return $875.00', claim: 'Claim deductions' },
    results: { pay: 'Paid', allGood: 'Rent released', report: 'Problem reported', movedOut: 'Moved out', returnDeposit: 'Deposit returned', claim: 'Claim filed' },
    testMoney: 'Test money',
    never: ['escrow', 'guaranteed', 'insured', 'float', 'seamless', 'peace of mind', 'bank-grade', 'AI-powered']
  };

  const rules = [
    { key: 'before', title: 'Before move-in', items: [
      "Deposit capped at one month's rent. Only the first month and the deposit are collected up front.",
      "A listing goes live only with the owner's written OK to sublet (or, in buildings with 4+ units, the RPL 226-b certified-mail request with 30 days' silence).",
      'Bank bookings close 5 business days before move-in (ACH settles in 4). Later bookings pay by card at cost.',
      'Lister cancels: the renter gets 100% back, the lister pays $0, and the cancellation shows on her profile.',
      'Renter cancels 14+ days out: 100% back. Under 14 days: the deposit comes back in full; the first month goes to the lister (minus the usual 10%) unless the room is re-rented for the same start date, then it comes back too.'
    ] },
    { key: 'movein', title: 'Move-in (48 h)', items: [
      'All good releases rent now. Silence releases it at 48 h. Report a problem freezes it.',
      'Only 4 reasons: not real or not as listed, no access, unsafe, lister not allowed to sublet. In-app photos required.',
      'The lister answers within 24 h. Verimate decides within 3 business days: full refund (fee $0), partial refund (fee shrinks with it), or release.'
    ] },
    { key: 'moveout', title: 'Move-out (deposit, NY 14-day law built in)', items: [
      "Day 0 is when the renter taps I've moved out, or the lease end date.",
      'Days 0–7: the lister taps Return deposit (one tap, full amount) or Claim deductions.',
      "Deductions: only New York's 4 reasons (unpaid rent, damage beyond normal wear, unpaid utilities owed to the lister, removing things left behind). Each line needs a photo, an amount, and a receipt or estimate. Total can't exceed the deposit.",
      'The undisputed part goes back the moment a claim is filed. The renter has 72 h to accept or dispute each line; silence means accept.',
      'Verimate compares the signed move-in and move-out photos and rules on disputed lines by Day 14. The lister carries the burden of proof. Small claims (Syracuse City Court, up to $5,000) stays open to both.',
      'Lister silent: reminders on Day 3 and Day 6, the Claim button disappears after Day 7, full auto-return on Day 8.',
      'Day 14 hard stop (GOL 7-108): the itemized statement and balance reach the renter, enforced by code. Missing it forfeits every deduction.',
      'Deposits go back by payout, not refund (ACH refunds are full-only, with a 180-day limit).'
    ] },
    { key: 'silence', title: 'Nobody taps anything', items: [
      'Rent goes to the lister at 48 h, the deposit to the renter on Day 8. Money is never stuck.'
    ] }
  ];
  const rulesShort = [
    { label: 'Move-in window', text: 'Rent goes to Lena after you tap All good, or on its own 48 h after move-in.' },
    { label: 'Problem at move-in', text: 'Report a problem within 48 h and the money stays frozen until Verimate decides, within 3 business days.' },
    { label: 'Deposit', text: 'Comes back in one tap after Lena confirms move-out. If she does nothing, it returns on its own on Day 8.' },
    { label: 'New York 14-day rule', text: 'Any deduction needs a photo and an amount, and is settled by Day 14 after move-out.' }
  ];

  const legal = "Verimate never keeps rent or deposits in its own bank account. Payments run on Stripe Connect, and Stripe Payments Company is a licensed money transmitter, including with New York's Department of Financial Services. The lister signs Verimate on as her payment agent, so the renter's payment counts as paid to her; that is the “agent of payee” route in NY Banking Law 641, and the federal payment-processor exemption covers the FinCEN side. Our software only tells Stripe when to release. Held money sits in Stripe's segregated funds or in the lister's connected balance under manual payouts (US holds of up to 2 years are allowed), never mixed with Verimate's own revenue, which is what GOL 7-103's no-commingling rule requires. The deposit is capped at one month and its interest belongs to the renter. At scale, deposits move to a trust account at a New York bank (needed for 6+ unit buildings). Two open items for counsel before real money: whether a success fee needs a broker license (RPL 440; fallback is a licensed Syracuse broker of record) and the apartment-information-vendor license for paid Premium (RPL 446-a). Airbnb, Spotahome and HousingAnywhere run the same “pay first, release after move-in” pattern.";
  const disclaimer = 'Test money. Not legal advice; a New York lawyer signs off before real money moves.';

  const qa = [
    { n: 1, q: 'Who holds the money? Are you allowed to?',
      a: "Not us. Stripe holds it; Stripe is a licensed money transmitter in New York, and the lister signs us on as her payment agent. Our rules decide when it's released, and a New York lawyer signs off before the first real dollar. Today is test money." },
    { n: 2, q: 'In New York the landlord holds the deposit. How can you?',
      a: "In a sublet, Lena is Jamie's landlord and we hold it as her agent, apart from our own money, capped at one month. The app enforces New York's 14-day return rule for her; the owner's original deposit is never touched." },
    { n: 3, q: "If you're paid when a room rents, aren't you an unlicensed broker?",
      a: "We take that seriously: we don't show rooms or negotiate leases, and before charging real fees we'll operate under a licensed Syracuse broker of record if counsel says so. Even if that costs us 20% of fees, year 1 stays above our original plan." },
    { n: 4, q: 'Facebook is free. Why would Lena pay?',
      a: 'An empty room costs her $875 a month. With us listing is free and she pays $87.50, about three days of rent, only after a verified renter is inside and her rent has arrived.' },
    { n: 5, q: 'What stops them from meeting here and paying on Venmo?',
      a: "The renter. Hold is free for them and it's the only way their $1,750 is protected; off-platform they're back to sending money to a stranger, and the FTC's median rental-scam loss is $1,000." },
    { n: 6, q: 'Is 280 deals real? What does a customer cost?',
      a: "It's 10% of about 2,800 Syracuse subleases a year, driven by about 2,000 students going abroad, more in spring. We reach them in pre-departure sessions and group chats for about $35 a deal, against $59 kept, and break even before salaries at about 141 deals." },
    { n: 7, q: 'What if it goes wrong: fake room, damage, nobody taps?',
      a: 'Fake room: full refund, because nothing was paid out. Damage needs a photo and an amount per line, the undisputed part comes back the same minute, and silence never freezes money: rent releases at 48 hours, the deposit returns on day 8.' },
    { n: 8, q: "$80 a deal is small. Why won't Airbnb or Zillow crush you?",
      a: "Airbnb takes 15.5% of the whole stay, about $586 here, and doesn't verify students; Zillow moves rent but never holds it or checks move-in. Our edge is campus density plus data nobody has: verified students and every lister's deposit-return record. Ten campuses is about $600K by year 3." }
  ];
  const pocket = [
    { q: 'Do you earn interest on held money?', a: "No. By New York law it's the student's." },
    { q: 'Why not charge the student?', a: "New York bars upfront tenant fees, and parents shouldn't pay to get their own deposit back." }
  ];

  /* Six-step renter tracker (book.html). */
  const tracker = [
    { key: 'paid', label: 'Paid', at: '2026-12-01T14:14' },
    { key: 'held', label: 'Held by Verimate', at: '2026-12-01T14:14' },
    { key: 'movein', label: 'Move-in confirmed', at: '2027-01-10T15:12' },
    { key: 'released', label: 'Rent released', at: '2027-01-10T15:12' },
    { key: 'moveout', label: 'Moved out', at: '2027-05-20T11:30' },
    { key: 'returned', label: 'Deposit returned', at: '2027-05-21T09:40' }
  ];

  /* ------------------------------------------------------------------ self-check */

  let setCheck = function () {};
  function check(opts) {
    opts = opts || {};
    const H = root.HOLD;
    const out = [];
    const eq = (name, got, want) => out.push({ name, got, want, ok: got === want });
    const D = H.deal, T = H.totals;

    eq('Upfront: first month + deposit = $1,750.00', D.upfront.firstMonth + D.upfront.deposit + D.upfront.verimateFee, 175000);
    eq('Upfront total field', D.upfront.total, 175000);
    eq('Lister fee = 10% of $875.00 = $87.50', D.listerFee, 8750);
    eq('First payout $787.50 + fee $87.50 = $875.00', D.listerFirstPayout + D.listerFee, 87500);
    eq('May proration 10/31 of $875.00 = $282.26', D.proratedMay, 28226);
    eq('Months 2-5 straight to Lena = $2,907.26', D.directRent, 290726);
    eq('Total rent = $3,782.26', D.totalRent, 378226);
    eq('Jamie paid in = $4,657.26', T.renterPaidIn, 465726);
    eq('Jamie net = rent only', T.renterPaidIn - T.renterGotBack, D.totalRent);
    eq('Lena received $787.50 + $2,907.26 = $3,694.76', T.listerReceived, 369476);
    eq('Money conserved: paid in = back + Lena + Verimate', T.renterPaidIn, T.renterGotBack + T.listerReceived + T.verimateRevenue);
    eq('Stripe costs = $13.66', T.stripe, 1366);
    eq('Stripe payouts $2.22 + $2.44 = $4.66', T.stripePayouts, 466);
    eq('Verimate costs this deal = $21.66', T.verimateCosts, 2166);
    eq('Verimate net this deal = $65.84', T.verimateNet, 6584);
    eq('Unit lines this deal sum to $65.84', sum(H.unit.thisDeal.lines, x => x.cents), 6584);
    eq('Average deal costs = $21.30', H.unit.average.costs, 2130);
    eq('Average deal contribution = $58.70', H.unit.average.net, 5870);
    eq('Card cost on $1,750.00 = $51.05', D.cardCost, 5105);
    eq('Premium card fee = $0.59', H.fees.premiumCardFee(), 59);
    eq('Year 1 lister fees = $22,400', H.year1.lines[0].cents, 2240000);
    eq('Year 1 Premium = $7,992', H.year1.lines[1].cents, 799200);
    eq('Year 1 revenue = $30,392', H.year1.revenue, 3039200);
    eq('Year 1 contribution = $23,956', H.year1.contribution, 2395600);
    eq('Year 1 result before team pay = $6,756', H.year1.result, 675600);
    eq('Year 1 money facilitated = $896K', H.year1.facilitated, 89600000);
    eq('Year 1 CAC = $35', H.year1.cac, 3500);
    eq('Break-even with Premium = 141 deals', H.year1.breakEvenWithPremium, 141);
    eq('Break-even without Premium = 296 deals', H.year1.breakEvenWithoutPremium, 296);
    eq('Downside revenue = $17,920', H.year1.downside.revenue, 1792000);
    eq('3-year: year 1 = $30,392', H.threeYear[0].revenue, 3039200);
    eq('3-year: year 2 = $227,940', H.threeYear[1].revenue, 22794000);
    eq('3-year: year 3 = $607,840', H.threeYear[2].revenue, 60784000);
    eq('Damage: $875.00 − $60.00 = $815.00 back now', H.branches.damage.states[0].renterBack, 81500);
    eq('Damage: $60.00 stays held', H.branches.damage.states[0].held, 6000);
    eq('What-if: refund $1,750.00', H.branches.whatIf.states[1].renterBack, 175000);
    eq('What-if: Verimate earns $0.00', H.branches.whatIf.states[1].verimateEarned, 0);
    eq('What-if: Verimate loses $8.00', H.branches.whatIf.states[1].verimateCosts, 800);
    eq('Beat 10: Verimate earned $87.50', H.beats[9].verimateEarned, 8750);
    eq('Beat 10: Verimate costs $21.66', H.beats[9].verimateCosts, 2166);
    eq('Beat 10: card shows $65.84 kept', H.beats[9].card[3].cents, 6584);
    eq('Beat 10: run total = $30,392', H.beats[9].run.total, 3039200);
    eq('Beat 7: Lena has $3,694.76', H.beats[6].listerReceived, 369476);
    eq('Flow: held after step 9 = $0.00', H.flow[8].held, 0);
    eq('Flow: renter changes sum to −$3,782.26', sum(H.flow, s => s.renter), -378226);
    eq('Flow: revenue sums to $87.50', sum(H.flow, s => s.revenue), 8750);

    // Every bar state: money is conserved and the ledger agrees with the bar.
    const states = H.beats.map(b => [b.id, b]).concat(
      H.branches.whatIf.states.map(s => ['what-if/' + s.id, s]), H.branches.damage.states.map(s => ['damage/' + s.id, s]));
    states.forEach(([id, s]) => {
      eq(id + ': paid in − back = held + Lena + Verimate', s.renterPaid - s.renterBack, s.held + s.listerReceived + s.verimateEarned);
      eq(id + ': ledger fees = Verimate earned', sum(s.ledgerRows.filter(r => r.kind !== 'cost'), r => r.cents), s.verimateEarned);
      eq(id + ': ledger costs = Verimate costs', -sum(s.ledgerRows.filter(r => r.kind === 'cost'), r => r.cents), s.verimateCosts);
    });

    // Weekdays printed in the model.
    [['2026-11-02', 'Mon'], ['2026-12-01', 'Tue'], ['2026-12-07', 'Mon'], ['2027-01-10', 'Sun'], ['2027-01-12', 'Tue'],
     ['2027-05-20', 'Thu'], ['2027-05-21', 'Fri'], ['2027-05-24', 'Mon'], ['2027-05-28', 'Fri'], ['2027-06-03', 'Thu']]
      .forEach(([d, w]) => eq('Weekday ' + d, date(d, 'day').slice(0, 3), w));
    eq('Day 7 = May 27', date.diffDays(D.deadlines.movedOut, D.deadlines.returnBy), 7);
    eq('Day 8 = May 28 auto-return', date.diffDays(D.deadlines.movedOut, D.deadlines.autoReturn), 8);
    eq('Day 14 = Jun 3 NY deadline', date.diffDays(D.deadlines.movedOut, D.deadlines.nyDeadline), 14);

    const bad = out.filter(r => !r.ok);
    bad.forEach(r => console.error('HOLD.check failed: ' + r.name + ' (got ' + r.got + ', want ' + r.want + ')'));
    const res = { ok: bad.length === 0, passed: out.length - bad.length, total: out.length, failed: bad, results: out };
    setCheck(res);
    return res;
  }

  /* ------------------------------------------------------------------ export */

  const HOLD = {
    version: '2026-10-15',
    money: money, moneyParts: moneyParts, moneyHTML: moneyHTML, date: date, MINUS: MINUS,
    fees: fees, people: people, deal: deal,
    pricing: pricing, comparison: comparison,
    flow: flow, totals: totals, endings: endings,
    beats: beats, branches: branches, activity: activity, tracker: tracker,
    unit: unit, yearModel: yearModel, year1: year1, threeYear: threeYear, upside: upside, nationalCeiling: nationalCeiling,
    promise: promise, vocab: vocab, rules: rules, rulesShort: rulesShort, legal: legal, disclaimer: disclaimer, qa: qa, pocket: pocket,
    sum: sum, check: check,
    /* beat(n) -> beat object for 1..10; state(hash) -> beat or branch state for '#beat-4', '#what-if', '#damage'. */
    beat: function (n) { return beats[n - 1] || null; },
    state: function (hash) {
      hash = String(hash || '').replace(/^#/, '');
      const m = hash.match(/^beat-(\d+)$/);
      if (m) return beats[+m[1] - 1] || null;
      if (hash === 'what-if') return branches.whatIf.states[branches.whatIf.states.length - 1];
      if (hash === 'damage') return branches.damage.states[0];
      return null;
    }
  };
  // The last check() result, readable as HOLD.checkResult (a getter, so the frozen object can still report it).
  let lastCheck = null;
  Object.defineProperty(HOLD, 'checkResult', { get: function () { return lastCheck; }, enumerable: true });
  setCheck = function (r) { lastCheck = r; };
  // Freeze the data so a page cannot change a shared number by accident.
  (function deepFreeze(o) { Object.freeze(o); Object.getOwnPropertyNames(o).forEach(k => { const d = Object.getOwnPropertyDescriptor(o, k); const v = d && d.value; if (v && (typeof v === 'object' || typeof v === 'function') && !Object.isFrozen(v)) deepFreeze(v); }); })(HOLD);
  root.HOLD = HOLD;
  check();
})(typeof window !== 'undefined' ? window : globalThis);
