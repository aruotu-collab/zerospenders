import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Generate UK city × category discovery offers with claim paths.
 * These are COMMUNITY leads — each has an official portal / how-to so members
 * can verify the deal exists (website, phone, or booking page).
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "data/offers/uk-discovery.json");

const UK_CITIES = [
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Glasgow",
  "Edinburgh",
  "Liverpool",
  "Bristol",
  "Sheffield",
  "Newcastle",
  "Nottingham",
  "Cardiff",
  "Belfast",
  "Leicester",
  "Coventry",
  "Bradford",
  "Stoke-on-Trent",
  "Wolverhampton",
  "Plymouth",
  "Southampton",
  "Reading",
  "Derby",
  "Portsmouth",
  "Brighton",
  "Milton Keynes",
  "Northampton",
  "Luton",
  "Bolton",
  "Bournemouth",
  "Norwich",
  "Swindon",
  "Swansea",
  "Southend-on-Sea",
  "Middlesbrough",
  "Peterborough",
  "Cambridge",
  "Oxford",
  "York",
  "Ipswich",
  "Blackpool",
  "Middleton",
  "Slough",
  "Watford",
  "Basingstoke",
  "Woking",
  "Cheltenham",
  "Exeter",
  "Gloucester",
  "Bath",
  "Canterbury",
  "Chester",
  "Durham",
  "Lancaster",
  "Lincoln",
  "Salisbury",
  "Winchester",
  "Worcester",
  "Inverness",
  "Aberdeen",
  "Dundee",
  "Stirling",
  "Perth",
  "Newport",
  "Wrexham",
  "Bangor",
  "Derry",
  "Lisburn",
  "Guildford",
  "Maidstone",
  "Colchester",
  "Crawley",
  "Eastbourne",
  "Hastings",
  "Worthing",
  "Harrogate",
  "Huddersfield",
  "Wakefield",
  "Doncaster",
  "Rotherham",
  "Barnsley",
  "Wigan",
  "Warrington",
  "Oldham",
  "Rochdale",
  "Salford",
  "Stockport",
  "Telford",
  "Shrewsbury",
  "Hereford",
  "Tamworth",
  "Nuneaton",
  "Rugby",
  "Solihull",
  "Sutton Coldfield",
  "West Bromwich",
  "Dudley",
  "Walsall",
  "Ilford",
  "Croydon",
  "Lewisham",
  "Greenwich",
  "Hackney",
  "Camden",
  "Islington",
  "Stratford",
  "Romford",
  "Harrow",
  "Ealing",
  "Hounslow",
  "Kingston upon Thames",
  "Richmond",
  "Bromley",
  "Orpington",
  "Dartford",
  "Gravesend",
  "Chatham",
  "Gillingham",
  "Ashford",
  "Folkestone",
  "Dover",
  "Margate",
  "Tunbridge Wells",
  "Sevenoaks",
  "Redhill",
  "Reigate",
  "Epsom",
  "Staines",
  "Uxbridge",
  "Hemel Hempstead",
  "St Albans",
  "Welwyn Garden City",
  "Stevenage",
  "Hitchin",
  "Bedford",
  "Kettering",
  "Corby",
  "Wellingborough",
  "Market Harborough",
  "Loughborough",
  "Mansfield",
  "Chesterfield",
  "Buxton",
  "Macclesfield",
  "Crewe",
  "Nantwich",
  "Ellesmere Port",
  "Birkenhead",
  "Wallasey",
  "Southport",
  "Preston",
  "Blackburn",
  "Burnley",
  "Lancaster",
  "Carlisle",
  "Kendal",
  "Barrow-in-Furness",
  "Whitehaven",
  "Workington",
  "Scunthorpe",
  "Grimsby",
  "Hull",
  "Beverley",
  "Scarborough",
  "Whitby",
  "Middlesbrough",
  "Stockton-on-Tees",
  "Darlington",
  "Hartlepool",
  "Sunderland",
  "Gateshead",
  "South Shields",
  "Morpeth",
  "Hexham",
  "Alnwick",
  "Berwick-upon-Tweed",
  "Galashiels",
  "Hawick",
  "Dumfries",
  "Ayr",
  "Kilmarnock",
  "Paisley",
  "Greenock",
  "Motherwell",
  "Hamilton",
  "Falkirk",
  "Kirkcaldy",
  "Dunfermline",
  "St Andrews",
  "Oban",
  "Fort William",
  "Elgin",
  "Peterhead",
  "Fraserburgh",
  "Wick",
  "Thurso",
  "Lerwick",
  "Kirkwall",
  "Stornoway",
  "Carmarthen",
  "Aberystwyth",
  "Llandudno",
  "Rhyl",
  "Colwyn Bay",
  "Holyhead",
  "Caernarfon",
  "Merthyr Tydfil",
  "Pontypridd",
  "Bridgend",
  "Barry",
  "Cwmbran",
  "Abergavenny",
  "Monmouth",
  "Chepstow",
  "Taunton",
  "Yeovil",
  "Bridgwater",
  "Weston-super-Mare",
  "Torquay",
  "Paignton",
  "Barnstaple",
  "Truro",
  "Penzance",
  "Falmouth",
  "Newquay",
  "St Austell",
  "Bodmin",
  "Salisbury",
  "Poole",
  "Christchurch",
  "Dorchester",
  "Weymouth",
  "Winchester",
  "Andover",
  "Farnborough",
  "Aldershot",
  "Camberley",
  "Wokingham",
  "Maidenhead",
  "Windsor",
  "High Wycombe",
  "Aylesbury",
  "Banbury",
  "Bicester",
  "Didcot",
  "Abingdon",
  "Newbury",
  "Chippenham",
  "Trowbridge",
  "Frome",
  "Warminster",
];

type Category = "GET" | "GO" | "EAT" | "LEARN" | "PLAY" | "TRY" | "KIDS" | "ONLINE";

type Template = {
  id: string;
  category: Category;
  subcategory: string;
  title: (city: string) => string;
  summary: (city: string) => string;
  howToClaim: (city: string) => string;
  claimUrl: (city: string) => string;
  claimPhone?: (city: string) => string | null;
  normalValue: number;
  tags: string[];
};

function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 90);
}

function hashScore(seed: string, min = 62, max = 88) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

const TEMPLATES: Template[] = [
  {
    id: "library-card",
    category: "LEARN",
    subcategory: "Library",
    title: (c) => `Free ${c} library card — books, Wi‑Fi & ebooks`,
    summary: (c) =>
      `Join ${c} public library for free. Borrow books, use Wi‑Fi, and often get BorrowBox/Libby ebooks.`,
    howToClaim: (c) =>
      `1. Open GOV.UK local library finder and select ${c}.\n2. Apply for a free library card online or in person (bring ID + proof of address).\n3. Use the card for loans, Wi‑Fi and digital apps.`,
    claimUrl: () => "https://www.gov.uk/local-library-services",
    normalValue: 0,
    tags: ["library", "ebooks", "wifi"],
  },
  {
    id: "library-storytime",
    category: "KIDS",
    subcategory: "Kids events",
    title: (c) => `Free children's storytime — ${c} libraries`,
    summary: (c) =>
      `Most ${c} public libraries run free rhyme time / storytime for under‑5s. Check the events calendar.`,
    howToClaim: (c) =>
      `1. Find ${c} library services via GOV.UK.\n2. Open the events / what's on page.\n3. Book if required, or turn up with your child.`,
    claimUrl: () => "https://www.gov.uk/local-library-services",
    normalValue: 8,
    tags: ["kids", "library", "storytime"],
  },
  {
    id: "council-museums",
    category: "GO",
    subcategory: "Museum",
    title: (c) => `Free civic museums & galleries in ${c}`,
    summary: (c) =>
      `Many ${c} council-run museums and galleries are free entry. Confirm opening times before you go.`,
    howToClaim: (c) =>
      `1. Search “${c} museum free entry” on the council or VisitBritain pages.\n2. Open the official venue page linked from search.\n3. Check free permanent collections vs ticketed exhibitions.`,
    claimUrl: () => "https://www.visitbritain.com/en/things-to-do",
    normalValue: 12,
    tags: ["museum", "gallery", "council"],
  },
  {
    id: "parks",
    category: "GO",
    subcategory: "Park",
    title: (c) => `Free parks & green spaces in ${c}`,
    summary: (c) =>
      `Public parks in and around ${c} are free to enter. Look for free outdoor events in summer.`,
    howToClaim: (c) =>
      `1. Open your council website for ${c} parks & open spaces.\n2. Pick a park and check any event listings.\n3. Visit during daylight — no ticket required for general access.`,
    claimUrl: () => "https://www.gov.uk/find-local-council",
    normalValue: 0,
    tags: ["park", "outdoors"],
  },
  {
    id: "eventbrite-free",
    category: "GO",
    subcategory: "Events",
    title: (c) => `Free events in ${c} this week (Eventbrite)`,
    summary: (c) =>
      `Community workshops, markets, meetups and gigs listed as free near ${c}. Filter by Free on Eventbrite.`,
    howToClaim: (c) =>
      `1. Open Eventbrite free events for ${c}.\n2. Pick an event and read the host’s claim instructions.\n3. Reserve a free ticket and bring the QR code / email.`,
    claimUrl: (c) =>
      `https://www.eventbrite.co.uk/d/united-kingdom--${encodeURIComponent(c.toLowerCase())}/free--events/`,
    normalValue: 15,
    tags: ["events", "community"],
  },
  {
    id: "meetup-free",
    category: "PLAY",
    subcategory: "Social",
    title: (c) => `Free Meetup groups near ${c}`,
    summary: (c) =>
      `Free social, hobby and fitness meetups around ${c}. RSVP on Meetup — most gatherings cost £0.`,
    howToClaim: (c) =>
      `1. Open Meetup and search ${c}.\n2. Filter to free events.\n3. RSVP and follow the organiser’s joining instructions.`,
    claimUrl: (c) => `https://www.meetup.com/find/?keywords=${encodeURIComponent(c)}&source=EVENTS`,
    normalValue: 10,
    tags: ["meetup", "social"],
  },
  {
    id: "facebook-free",
    category: "GET",
    subcategory: "Free stuff",
    title: (c) => `Free stuff near ${c} — local giveaway groups`,
    summary: (c) =>
      `Neighbourhood freebie / Buy Nothing style groups serving ${c}. Items are free but stock changes hourly.`,
    howToClaim: (c) =>
      `1. Search Facebook for “Free ${c}” or “Buy Nothing ${c}”.\n2. Join a local group and follow the rules.\n3. Message the poster to arrange collection — no payment.`,
    claimUrl: () => "https://www.facebook.com/",
    normalValue: 20,
    tags: ["free-stuff", "community"],
  },
  {
    id: "freecycle",
    category: "GET",
    subcategory: "Free stuff",
    title: (c) => `Freecycle / freegle offers near ${c}`,
    summary: (c) =>
      `Free furniture, kids kit and household items listed by people near ${c}. Collection only.`,
    howToClaim: (c) =>
      `1. Open Freegle or Freecycle and set location to ${c}.\n2. Reply to an OFFERed post.\n3. Arrange collection with the giver — never pay.`,
    claimUrl: () => "https://www.ilovefreegle.org/",
    normalValue: 25,
    tags: ["freecycle", "free-stuff"],
  },
  {
    id: "gym-trial",
    category: "TRY",
    subcategory: "Gym trial",
    title: (c) => `Free gym trial day near ${c}`,
    summary: (c) =>
      `Budget gyms around ${c} often give a free day pass. Book online before you arrive.`,
    howToClaim: (c) =>
      `1. Search PureGym / The Gym Group / local leisure centre for ${c}.\n2. Book a free trial on the official site.\n3. Bring photo ID; decline membership pressure if you only wanted the trial.`,
    claimUrl: () => "https://www.puregym.com/",
    normalValue: 25,
    tags: ["gym", "trial"],
  },
  {
    id: "food-bank-volunteer",
    category: "GO",
    subcategory: "Volunteer",
    title: (c) => `Volunteer sessions — food banks near ${c}`,
    summary: (c) =>
      `Not a free meal for volunteers to take home — but free community volunteering near ${c}. Listed so hunters find local impact days.`,
    howToClaim: (c) =>
      `1. Open the Trussell Trust find-a-food-bank tool.\n2. Search near ${c}.\n3. Contact the food bank by phone/email on their page to book a volunteer slot.`,
    claimUrl: () => "https://www.trusselltrust.org/get-help/find-a-foodbank/",
    normalValue: 0,
    tags: ["volunteer", "community"],
  },
  {
    id: "university-open",
    category: "LEARN",
    subcategory: "Open lectures",
    title: (c) => `Free public lectures & open days near ${c}`,
    summary: (c) =>
      `Universities and museums near ${c} publish free public talks. Book when tickets are free.`,
    howToClaim: (c) =>
      `1. Search Eventbrite / university sites for “free lecture ${c}”.\n2. Reserve a free ticket.\n3. Bring confirmation email to the venue.`,
    claimUrl: (c) =>
      `https://www.eventbrite.co.uk/d/united-kingdom--${encodeURIComponent(c.toLowerCase())}/free--events/education/`,
    normalValue: 15,
    tags: ["lectures", "university"],
  },
  {
    id: "church-lunch",
    category: "EAT",
    subcategory: "Community meal",
    title: (c) => `Community free / pay-what-you-can meals — ${c}`,
    summary: (c) =>
      `Churches, mosques and community centres in ${c} sometimes host free or donation meals. Confirm by phone before travelling.`,
    howToClaim: (c) =>
      `1. Search “community meal ${c}” or “pay what you can ${c}”.\n2. Call or email the venue listed on their page.\n3. Arrive at the stated time — bring your own bag if takeaway is offered.`,
    claimUrl: () => "https://www.google.com/maps",
    normalValue: 8,
    tags: ["community-meal", "food"],
  },
  {
    id: "playgrounds",
    category: "KIDS",
    subcategory: "Playgrounds",
    title: (c) => `Free playgrounds & splash parks — ${c}`,
    summary: (c) =>
      `Council playgrounds around ${c} are free. Seasonal splash pads may also be free entry.`,
    howToClaim: (c) =>
      `1. Open the ${c} council parks page.\n2. Find playgrounds / splash parks.\n3. Visit during opening hours — no ticket for general play.`,
    claimUrl: () => "https://www.gov.uk/find-local-council",
    normalValue: 0,
    tags: ["kids", "playground"],
  },
  {
    id: "parkrun",
    category: "PLAY",
    subcategory: "Running",
    title: (c) => `parkrun near ${c} — free 5k`,
    summary: (c) =>
      `Weekly free timed 5k community runs near ${c}. Register once online, then just turn up.`,
    howToClaim: (c) =>
      `1. Register once at parkrun.com (free).\n2. Find events near ${c}.\n3. Print or show your barcode and arrive 15 mins early.`,
    claimUrl: () => "https://www.parkrun.org.uk/",
    normalValue: 0,
    tags: ["running", "fitness"],
  },
  {
    id: "soft-play-trial",
    category: "KIDS",
    subcategory: "Soft play",
    title: (c) => `Soft play free trial / off-peak deals — ${c}`,
    summary: (c) =>
      `Soft play centres near ${c} sometimes offer free first visits or voucher trials. Call to confirm.`,
    howToClaim: (c) =>
      `1. Search soft play centres in ${c}.\n2. Check their website for free trial / first visit offers.\n3. Call the centre if no web offer — ask about weekday free sessions.`,
    claimUrl: (c) => `https://www.google.com/maps/search/soft+play+${encodeURIComponent(c)}`,
    normalValue: 12,
    tags: ["kids", "soft-play"],
  },
  {
    id: "cinema-carers",
    category: "PLAY",
    subcategory: "Cinema",
    title: (c) => `Carers / autism-friendly free cinema slots near ${c}`,
    summary: (c) =>
      `Some UK cinemas near ${c} run free or discounted carers’ / autism-friendly screenings. Confirm eligibility.`,
    howToClaim: (c) =>
      `1. Check Vue / Odeon / local indie cinema pages for ${c}.\n2. Look for carers’ or CEA Card free companion tickets.\n3. Book by phone or online with your card details.`,
    claimUrl: () => "https://www.ceacard.co.uk/",
    normalValue: 12,
    tags: ["cinema", "carers"],
  },
  {
    id: "blood-donor",
    category: "GET",
    subcategory: "Donor perk",
    title: (c) => `NHS Blood donation near ${c} — free refreshments`,
    summary: (c) =>
      `Donate blood near ${c} and receive free drinks/snacks. The perk is free; you give time and blood.`,
    howToClaim: (c) =>
      `1. Open NHS Blood and Transplant and book a session near ${c}.\n2. Attend your appointment.\n3. Enjoy free refreshments after donation.`,
    claimUrl: () => "https://www.blood.co.uk/",
    normalValue: 3,
    tags: ["nhs", "donor"],
  },
  {
    id: "jobcentre-digital",
    category: "ONLINE",
    subcategory: "Public Wi‑Fi",
    title: (c) => `Free public Wi‑Fi & PCs — ${c} libraries`,
    summary: (c) =>
      `${c} libraries usually provide free Wi‑Fi and bookable PCs. Bring ID for a free card if you need longer sessions.`,
    howToClaim: (c) =>
      `1. Find ${c} libraries on GOV.UK.\n2. Walk in for Wi‑Fi or book a PC session.\n3. Ask staff for guest Wi‑Fi password if you do not have a card yet.`,
    claimUrl: () => "https://www.gov.uk/local-library-services",
    normalValue: 0,
    tags: ["wifi", "library"],
  },
  {
    id: "museum-late",
    category: "GO",
    subcategory: "Late opening",
    title: (c) => `Free museum Lates / after-hours in ${c}`,
    summary: (c) =>
      `Galleries near ${c} sometimes host free evening openings. Follow venue newsletters.`,
    howToClaim: (c) =>
      `1. Follow major ${c} museums on social or email lists.\n2. Watch for free Late events.\n3. Book free tickets when the event page goes live.`,
    claimUrl: () => "https://www.visitbritain.com/en/things-to-do",
    normalValue: 18,
    tags: ["museum", "lates"],
  },
  {
    id: "farmers-sample",
    category: "EAT",
    subcategory: "Samples",
    title: (c) => `Free food samples — ${c} markets`,
    summary: (c) =>
      `Farmers’ markets and food halls around ${c} often give free tastings. No signup — just ask politely.`,
    howToClaim: (c) =>
      `1. Find the ${c} farmers’ market or food hall timetable.\n2. Visit during trading hours.\n3. Ask stalls for a free taste — not every stall offers samples.`,
    claimUrl: (c) => `https://www.google.com/maps/search/farmers+market+${encodeURIComponent(c)}`,
    normalValue: 5,
    tags: ["samples", "market"],
  },
];

type Offer = {
  slug: string;
  title: string;
  summary: string;
  category: Category;
  subcategory: string;
  location: string;
  city: string;
  country: "GB";
  freeScore: number;
  normalValue: number;
  requiresCard: boolean;
  cancelReminder: boolean;
  verification: "COMMUNITY";
  tags: string[];
  claimUrl: string | null;
  claimPhone: string | null;
  claimEmail: string | null;
  howToClaim: string | null;
  sourceName: string;
  sourceType: "COMMUNITY";
  evergreen: false;
};

function main() {
  const uniqueCities = Array.from(new Set(UK_CITIES));
  const used = new Set<string>();
  const offers: Offer[] = [];

  for (const city of uniqueCities) {
    for (const t of TEMPLATES) {
      const base = slugify(`uk-${t.id}-${city}`);
      let slug = base;
      let i = 2;
      while (used.has(slug)) {
        slug = `${base}-${i}`;
        i += 1;
      }
      used.add(slug);

      offers.push({
        slug,
        title: t.title(city),
        summary: t.summary(city),
        category: t.category,
        subcategory: t.subcategory,
        location: `${city}, GB`,
        city,
        country: "GB",
        freeScore: hashScore(slug),
        normalValue: t.normalValue,
        requiresCard: false,
        cancelReminder: false,
        verification: "COMMUNITY",
        tags: ["uk", "discovery", "community", ...t.tags],
        claimUrl: t.claimUrl(city),
        claimPhone: t.claimPhone?.(city) ?? null,
        claimEmail: null,
        howToClaim: t.howToClaim(city),
        sourceName: "UK city discovery engine",
        sourceType: "COMMUNITY",
        evergreen: false,
      });
    }
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(offers, null, 2));
  console.log(`Wrote ${offers.length} UK discovery offers → ${OUT}`);
  console.log(`Cities: ${uniqueCities.length} × templates: ${TEMPLATES.length}`);
}

main();
