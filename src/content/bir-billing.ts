// Static, factual reference content about Bir Billing and paragliding here.
// Kept in one place so the /bir-billing guide, the homepage sections, the
// FAQ page and the assistant can all draw on the same wording. These are
// general facts — exact age / weight / duration limits always live on the
// individual package pages (they vary by operator and package), and the
// copy here says so.

export type Fact = { label: string; value: string; note?: string };

export const BIR_BILLING_FACTS: Fact[] = [
  { label: "Takeoff — Billing", value: "~2,400 m", note: "≈ 7,900 ft above sea level" },
  { label: "Landing — Bir", value: "~1,400 m", note: "the landing field beside Bir village" },
  { label: "Vertical drop", value: "~1,000 m", note: "one of the biggest of any commercial site in India" },
  { label: "Flyable days a year", value: "200+", note: "outside the monsoon months" },
  { label: "World Cup", value: "2015", note: "Bir Billing hosted India's first Paragliding World Cup" },
];

// Season — Bir Billing closes for the monsoon. These windows are stable
// year to year but weather has the final say on any given day.
export const SEASONS: { window: string; label: string; detail: string }[] = [
  {
    window: "Mid-Sep – Nov",
    label: "Best",
    detail: "Clear skies, gentle thermals, green valley after the rains. The most reliable flying of the year.",
  },
  {
    window: "Dec – Feb",
    label: "Good, cold",
    detail: "Crisp, stable air and sharp mountain views. Dress properly — it is genuinely cold at takeoff.",
  },
  {
    window: "Mar – Jun",
    label: "Best (strong)",
    detail: "Long days and strong thermals — great for cross-country, occasionally bumpy for a first tandem.",
  },
  {
    window: "Jul – Mid-Sep",
    label: "Closed",
    detail: "Monsoon. Flying is suspended (roughly 1 Jul – 15 Sep). Hotels and treks stay open.",
  },
];

export const HOW_IT_WORKS: { title: string; body: string }[] = [
  {
    title: "Pick and book online",
    body: "Choose a flight, course, room or activity, pick a date or slot, and pay securely. Your seat is locked the moment payment clears.",
  },
  {
    title: "Get your confirmation",
    body: "A confirmation with the meeting point, time and pilot / operator details reaches you by email straight away. No phone tag.",
  },
  {
    title: "Show up and fly",
    body: "Reach the takeoff or meeting point at your slot time. Your pilot handles the wing, the run and the landing — you just enjoy the view.",
  },
];

export const WHY_BIR_BILLING: { title: string; body: string }[] = [
  {
    title: "A world-class site",
    body: "Bir Billing is widely called the paragliding capital of India and hosted the country's first Paragliding World Cup in 2015. The long, stable ridge and big vertical make it beginner-friendly and good enough for record cross-country flights.",
  },
  {
    title: "No experience needed",
    body: "A tandem flight needs zero training. You are clipped in next to a licensed pilot who does everything — you sit back, and after a short run you are airborne.",
  },
  {
    title: "More than the flight",
    body: "Camping under the Dhauladhar, the Triund and waterfall treks, Tibetan monasteries in Bir, cafés and a monastery colony — plenty to fill two or three days around your flight.",
  },
];

// How to reach Bir. Distances/times are typical road figures — they move
// with traffic and weather.
export const GETTING_THERE: { from: string; how: string; time: string }[] = [
  { from: "Delhi", how: "Overnight Volvo bus to Baijnath / Bir, or drive via Chandigarh–Bilaspur–Mandi", time: "≈ 12–13 hrs · 520 km" },
  { from: "Chandigarh", how: "Taxi or bus via Una–Amb–Jawalamukhi", time: "≈ 8 hrs · 285 km" },
  { from: "Gaggal Airport (Kangra)", how: "Nearest airport — taxi from there to Bir", time: "≈ 2 hrs · 70 km" },
  { from: "Pathankot", how: "Nearest broad-gauge railhead — taxi, or the narrow-gauge toy train to Ahju/Baijnath", time: "≈ 3.5 hrs · 145 km" },
];

export const WHAT_TO_BRING: string[] = [
  "Closed sports or trekking shoes — no sandals or slip-ons",
  "Full-length trousers and a windproof jacket (takeoff is cold year-round)",
  "Sunglasses and a little sunscreen",
  "A tightly-secured phone strap if you want to film — or add a GoPro to your package",
  "Light breakfast only; skip a heavy meal right before flying",
];

// Seed FAQ content. Shown on the /faq page and detail pages until an admin
// adds their own in the dashboard (dashboard entries are shown as well).
export type SeedFaq = { category: "GENERAL" | "PARAGLIDING" | "SCHOOL" | "HOTEL"; question: string; answer: string };

export const SEED_FAQS: SeedFaq[] = [
  {
    category: "PARAGLIDING",
    question: "Do I need any experience or training to fly?",
    answer:
      "No. Every flight on Glideinbir marked 'tandem' is flown with a licensed pilot who controls the wing for the whole flight. You get a two-minute briefing, a short run off the slope, and then you are simply a passenger enjoying the view.",
  },
  {
    category: "PARAGLIDING",
    question: "Is tandem paragliding in Bir Billing safe?",
    answer:
      "Bir Billing is one of the most established flying sites in the world and pilots here are licensed. Tandem wings are certified and pilots carry a reserve parachute. The real risk factor is weather, so flights are only run when conditions are right — a pilot calling off your slot and rescheduling is the system working, not failing.",
  },
  {
    category: "PARAGLIDING",
    question: "How long does a flight last?",
    answer:
      "A standard tandem flight is about 15–30 minutes in the air, depending on the package and the day's conditions. Cross-country and 'high' flights run an hour or more. The exact duration for each package is on its page.",
  },
  {
    category: "PARAGLIDING",
    question: "What are the age and weight limits?",
    answer:
      "Limits vary by operator and package and are listed on each package page — as a rough guide, most accept passengers from about 12 years and between roughly 30 and 90 kg. Children fly with parental consent. If you are close to a limit, check the package page or ask us before booking.",
  },
  {
    category: "PARAGLIDING",
    question: "Can I get a video of my flight?",
    answer:
      "Yes — many packages include or offer a GoPro video and photos shot by the pilot on a wing-mounted pole. Look for it on the package page, or ask your pilot at takeoff.",
  },
  {
    category: "PARAGLIDING",
    question: "What if the weather cancels my flight?",
    answer:
      "If conditions are unsafe your flight is rescheduled to another slot, or refunded per the cancellation policy. Safety calls are the pilot's and are final.",
  },
  {
    category: "PARAGLIDING",
    question: "What should I wear and bring?",
    answer:
      "Closed shoes (sports or trekking), full-length trousers, and a windproof jacket — takeoff at Billing is cold all year. Bring sunglasses. Eat light before flying.",
  },
  {
    category: "GENERAL",
    question: "When is the paragliding season in Bir Billing?",
    answer:
      "Roughly mid-September to the end of June. Flying is suspended during the monsoon (about 1 July to 15 September). The most reliable months are October–November and March–May.",
  },
  {
    category: "GENERAL",
    question: "How do I get to Bir Billing?",
    answer:
      "Overnight Volvo bus from Delhi to Baijnath/Bir (~12–13 hrs), or taxi from Chandigarh (~8 hrs). The nearest airport is Gaggal/Kangra (~70 km) and the nearest broad-gauge railhead is Pathankot (~145 km).",
  },
  {
    category: "GENERAL",
    question: "How far ahead should I book?",
    answer:
      "For weekends and the peak October and May windows, a few days to a week ahead is wise — slots do sell out. Midweek in shoulder season you can often book a day before.",
  },
  {
    category: "GENERAL",
    question: "How do payments and confirmations work?",
    answer:
      "You pay securely online at checkout and your slot is held immediately. A confirmation with the meeting point and time is emailed to you at once. You can see all your bookings in your account.",
  },
  {
    category: "GENERAL",
    question: "Can I book a flight, a room and a trek together?",
    answer:
      "Yes — that is the point of Glideinbir. Add a flight, a course, a hotel room and an adventure activity to one checkout and pay once, with a single confirmation.",
  },
  {
    category: "SCHOOL",
    question: "Which course should I start with?",
    answer:
      "If you have never flown, start with a P1–P2 beginner course: ground handling, your first solo hops, and short flights under radio guidance. P3 builds altitude control and thermalling; P4 is toward cross-country and independence.",
  },
  {
    category: "SCHOOL",
    question: "How long does a beginner course take?",
    answer:
      "A P1–P2 course typically runs 5–8 days; going through P3 takes around two weeks depending on weather and how fast you progress. Exact durations are on each course page.",
  },
  {
    category: "SCHOOL",
    question: "Is equipment included in a course?",
    answer:
      "Yes — training wing, harness, helmet and radio are provided for the duration of the course. You need closed shoes, sun protection and clothing you can move in.",
  },
  {
    category: "SCHOOL",
    question: "Do I need to be fit to learn?",
    answer:
      "Reasonable general fitness helps — you will be carrying a pack and doing short uphill runs during ground handling. There is no need to be an athlete. Tell your instructor about any injury or medical condition beforehand.",
  },
  {
    category: "HOTEL",
    question: "Where should I stay — Bir or Billing?",
    answer:
      "Almost everyone stays in Bir, near the landing field, cafés and monasteries. Billing is just the takeoff — a 40-minute drive up, with only basic dhabas and camping.",
  },
  {
    category: "HOTEL",
    question: "How close are the hotels to the landing site?",
    answer:
      "The stays listed on Glideinbir are in and around Bir village, most within a few minutes of the landing field. Each hotel page shows its location.",
  },
  {
    category: "HOTEL",
    question: "Can I check in early or leave my bags before a flight?",
    answer:
      "Most Bir stays are flexible with luggage drop even before check-in — message the property through your booking. Standard check-in is on each hotel page.",
  },
];
