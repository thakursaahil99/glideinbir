// Built-in blog articles. Shown on /blog and /blog/[slug] alongside any
// posts an admin writes in the dashboard (a dashboard post with the same
// slug wins). Bodies use the small Markdown subset that <ArticleBody />
// understands: ## / ### headings, "- " bullets, blank-line paragraphs,
// **bold**. Facts here are general and stable — anything that varies by
// operator/package says so and points at the package page.

export type SeedPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string; // ISO date
  body: string;
};

export const SEED_POSTS: SeedPost[] = [
  {
    slug: "how-to-reach-bir-billing",
    title: "How to Reach Bir Billing: Bus, Train, Flight and Taxi",
    excerpt:
      "Bir has no airport or main railway station of its own. Here is every practical way to get there from Delhi, Chandigarh and the nearest transport hubs.",
    publishedAt: "2026-08-20",
    body: `Bir is a small village in the Kangra valley of Himachal Pradesh. It has no airport and no broad-gauge railway station, so getting there is always a road journey for the last stretch. These are the realistic options.

## By overnight bus from Delhi

This is how most travellers arrive. HRTC and private Volvo buses run in the evening from Delhi (ISBT Kashmere Gate and Majnu ka Tila) and reach Baijnath or Bir the next morning. The trip is roughly **12–13 hours over about 520 km**. Book a seat a few days ahead for weekends and the October and May peaks.

If your bus terminates at Baijnath, it is a short 15-minute local taxi or bus hop to Bir.

## By taxi or bus from Chandigarh

From Chandigarh the drive is about **8 hours (285 km)** via Una, Amb and Jawalamukhi. A private taxi is the comfortable choice; state buses also run this route through the day.

## By air

The nearest airport is **Gaggal (Kangra Airport)**, about **70 km / 2 hours** from Bir, with limited flights from Delhi. From Gaggal you take a taxi. Dharamshala is the same airport.

## By train

The nearest broad-gauge railhead is **Pathankot (~145 km, ~3.5 hours by road)**. From Pathankot you can also take the narrow-gauge Kangra Valley "toy train" toward Ahju and Baijnath, close to Bir — slow and scenic rather than fast.

## Getting up to the takeoff

Bir village sits by the landing field. **Billing, the takeoff, is ~14 km and a 40-minute drive above Bir**, on a narrow mountain road. If you have booked a tandem flight, your operator arranges the drive up as part of the package — you do not need your own vehicle.

You can book a bus seat or a private taxi to Bir through Glideinbir in the same checkout as your flight and stay.`,
  },
  {
    slug: "best-time-to-visit-bir-billing",
    title: "Best Time to Visit Bir Billing for Paragliding",
    excerpt:
      "Bir Billing flies 200+ days a year, but the experience changes a lot by season. Here is the month-by-month picture and when to avoid.",
    publishedAt: "2026-08-14",
    body: `Bir Billing has one of the longest paragliding seasons in India, but conditions shift through the year. Pick your window based on what you want.

## October to November — the best all-round window

Clear skies after the monsoon, gentle morning thermals, and a green valley. This is the most reliable flying of the year and the easiest for a first tandem. It is also the busiest — book flights and hotels ahead.

## December to February — cold and crisp

Stable air, very sharp mountain views, and the chance of snow on the Dhauladhar behind you. Flying still happens on clear days. **Dress seriously** — it is genuinely cold at 2,400 m takeoff even when Bir village feels mild.

## March to June — long days, strong lift

Thermals get strong and days get long, which is excellent for cross-country pilots and for staying up longer on a tandem. The trade-off is that afternoons can be bumpy, so morning slots are calmer if it is your first flight.

## July to mid-September — closed for the monsoon

Paragliding is suspended, roughly **1 July to 15 September**, because of rain and unstable air. Hotels, cafés and some treks stay open, and the valley is at its greenest, but you will not fly.

## Time of day

Whatever the month, **morning flights are smoother** and less likely to be cancelled by wind picking up. If you can only do an afternoon slot, that is fine too — just expect livelier air.

Every flight is weather-dependent on the day. A pilot rescheduling your slot for conditions is the system working as intended.`,
  },
  {
    slug: "is-paragliding-in-bir-billing-safe",
    title: "Is Paragliding in Bir Billing Safe? What to Know Before You Fly",
    excerpt:
      "A straight answer, plus the things that actually affect safety on a tandem flight and what you can do about them.",
    publishedAt: "2026-08-08",
    body: `Tandem paragliding in Bir Billing is a well-established activity with a strong overall record, but it is an adventure sport, not a fairground ride. Here is an honest picture.

## Who flies you

On a tandem flight you are harnessed to a **licensed pilot** who controls the wing for the entire flight. Tandem wings are certified, and pilots carry a **reserve parachute**. Ask your operator about the pilot's experience and licensing if you want to — a good operator will tell you.

## The real variable is weather

Most incidents anywhere in the sport trace back to flying in the wrong conditions. Bir Billing pilots call off flights when wind or air is unsuitable. **If your slot gets rescheduled, that is the safety system working.** Do not push a pilot to fly if they are hesitant.

## What you can do

- Book a **morning slot** — the air is calmer.
- Tell the operator in advance about a **heart condition, recent injury, back problem, or pregnancy**.
- Wear **closed shoes** and follow the pilot's instructions on the run and the landing exactly.
- Check whether **paragliding insurance** is included or available — some visitors buy short-term adventure cover.

## Regulation

Himachal's tourism department sets operating guidelines and standard operating procedures for paragliding at Bir Billing, including minimum standards and seasonal suspensions. Book with an operator who works within them.

Flown sensibly, with a licensed pilot, in good conditions, a Bir Billing tandem is about as safe as adventure flying gets in India.`,
  },
  {
    slug: "bir-billing-in-monsoon",
    title: "Bir Billing in the Monsoon: What's Open and What's Not",
    excerpt:
      "Paragliding stops for the rains, but the valley does not shut down. What you can and can't do between July and mid-September.",
    publishedAt: "2026-07-30",
    body: `The Bir Billing paragliding season pauses for the monsoon, roughly **1 July to 15 September**. If you are travelling in that window, here is what to expect.

## Paragliding: closed

Flying is officially suspended. Rain, low cloud on the ridge and unstable air make it unsafe, and operators do not run tandem flights. Do not plan a trip around flying in July or August — you will be disappointed.

The season reopens around **mid-September**, and the first clear weeks after it are some of the best flying of the year.

## What stays open

- **Hotels and cafés** in Bir run normally, and rates are at their lowest.
- The **Tibetan monasteries** and the monastery café colony are pleasant in the rain.
- Some **lower-altitude walks** are still doable between showers, though trails get slippery and leeches appear in the forest.
- The valley is **lush and green** — good for photography if you do not mind cloud.

## What to be careful about

- **Roads** can be affected by landslides during heavy spells; check conditions before travelling and keep buffer days.
- **High treks** (Rajgundha, snow line routes) are not advisable in peak monsoon.

## Better plan

If your dates are flexible, aim for **late September or October** instead — you get the green valley plus flying. If they are fixed in monsoon, come for the quiet, the cafés and the price, and treat any clear afternoon as a bonus.`,
  },
  {
    slug: "which-paragliding-course-p1-p2-p3-p4",
    title: "P1 to P4: Which Paragliding Course Should You Take?",
    excerpt:
      "The pilot rating system explained in plain language, so you know which course to book as a complete beginner or a returning student.",
    publishedAt: "2026-07-22",
    body: `Paragliding courses are usually described by pilot rating levels — P1, P2, P3, P4. Here is what each one actually means and where to start.

## P1–P2: the beginner course

This is where everyone with no experience begins. You spend the first days on **ground handling** — inflating, controlling and steering the wing while still on your feet on the training slope. Then you move to **short solo flights**: low hops off a gentle slope, and later slightly higher flights, all under radio guidance from your instructor.

By the end you can launch, fly a straight glide and land safely on your own in calm conditions. A P1–P2 course typically runs **5–8 days**, weather depending.

## P3: the club pilot

P3 builds the skills to actually stay up: **altitude control, turns, ridge soaring and an introduction to thermalling** — using rising air to climb rather than just gliding down. Going from beginner through P3 usually takes around **two weeks** total.

## P4: toward cross-country

P4 is about flying **independently and further** — reading the sky, flying cross-country routes, and handling a wider range of conditions. This is a serious commitment of time and repeated trips, not a one-week holiday course.

## Which to book

- **Never flown?** Book a P1–P2 course.
- **Done a beginner course elsewhere?** A P3 course continues from there.
- **Just want the feeling of flying once?** You do not need a course at all — book a **tandem flight**.

Equipment (training wing, harness, helmet, radio) is included for the course. Each course page lists the exact syllabus, duration and batch dates.`,
  },
  {
    slug: "first-tandem-flight-what-to-expect",
    title: "Your First Tandem Flight in Bir Billing: What Actually Happens",
    excerpt:
      "Step by step, from the drive up to Billing to the landing in Bir — so nothing on the day surprises you.",
    publishedAt: "2026-07-15",
    body: `If you have never paraglided, the unknown is the nervous part. Here is exactly how a tandem flight goes.

## Before

You meet your operator in Bir at your slot time. Eat something **light** beforehand — not a heavy meal. Wear **closed shoes, full-length trousers and a windproof jacket**; takeoff is cold. Leave loose items behind or secure them.

## The drive up

A vehicle takes you up the mountain road to **Billing at ~2,400 m**. It is about 40 minutes and the road is narrow and winding — if you get car sick, mention it.

## Takeoff

At the top the pilot lays the wing out behind you and clips you into the **front** of a two-person harness, then checks every line. You wait for a clean cycle of wind. When the pilot says go, you both **run a few steps down the slope** — keep running, do not sit down — and then the ground simply drops away. It happens fast and it is smooth.

## In the air

You settle back into the seat of the harness. For the next **15–30 minutes** (longer on bigger packages) you have the Dhauladhar range on one side and the valley on the other. If the air is buoyant the pilot may spiral up in a thermal; **if you would prefer a calm, straight flight, say so before takeoff.** Tell the pilot if you feel unwell.

## Landing

You come into the **landing field beside Bir village**. The pilot will tell you to stand up out of the seat and get your legs ready; you do a short **standing jog** as you touch down. That is it.

## Video

Many packages include or offer a **GoPro video** filmed by the pilot on a wing-side pole. Check the package page or ask at takeoff.`,
  },
  {
    slug: "treks-around-bir-billing",
    title: "Treks Around Bir Billing: Triund, Waterfall, Rajgundha and More",
    excerpt:
      "A 20-minute flight is not a trip. These are the walks and treks that fill the rest of your days in the valley.",
    publishedAt: "2026-07-06",
    body: `Most people spend two or three days around Bir. Here are the walks worth doing, from a short afternoon to multi-day routes.

## Half-day and easy

- **Bir waterfall walk** — an easy forest walk from Bir to a seasonal waterfall, a few hours return. Best right after the monsoon when it is flowing.
- **Monastery loop in Bir** — Chokling and Palpung Sherabling area, the Tibetan colony and the café strip. Flat, cultural, no effort.

## Full day

- **Billing sunrise / sunset run** — drive up to the takeoff just for the view over the valley, with tea at the dhabas.
- **Bir to Gunehar** — a short hill village walk with a small waterfall and cafés.

## Multi-day

- **Triund (via Dharamkot / McLeod Ganj)** — the classic Dhauladhar viewpoint trek, usually done as an overnight from the Dharamshala side, an easy drive from Bir.
- **Rajgundha valley** — a semi-tribal village across the ridge, reached on foot from Billing or by a long rough drive. Camp overnight.
- **Waterfall / hot-spring treks** and routes toward the snow line in the colder months — done with a guide.

## Booking

Guided treks, camping and permits (where needed) can go in the same checkout as your flight and stay. Difficulty, duration and what is included are on each activity page.`,
  },
];
