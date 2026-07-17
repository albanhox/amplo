/**
 * Niche catalog — the "plug & play" library.
 *
 * Each niche seeds the AI agents with the right vocabulary, tone, content
 * angles, and sample output. Adding a new vertical is just adding an entry
 * here; the rest of the product is niche-agnostic and reads from this list.
 */

export type ContentType = "tip" | "video" | "review" | "offer" | "seo";

export interface Niche {
  id: string;
  emoji: string;
  label: string;
  /** Plural audience noun used in copy, e.g. "realtors". */
  audience: string;
  /** Default platforms this niche performs best on. */
  platforms: string[];
  /** Tone words that shape the brand voice. */
  toneWords: string[];
  /** Content angles the agent rotates through. */
  angles: string[];
  /** A sample business identity for demos/previews. */
  sample: {
    name: string;
    handle: string;
    initials: string;
  };
  /** Seed posts by content type (used as demo output + few-shot examples). */
  seedPosts: Record<ContentType, string>;
  /** A representative Google review + the post the agent turns it into. */
  reviewExample: {
    author: string;
    initials: string;
    stars: number;
    text: string;
    generatedPost: string;
  };
}

export const NICHES: Niche[] = [
  {
    id: "realtor",
    emoji: "🏡",
    label: "Realtor",
    audience: "realtors & real estate agents",
    platforms: ["Instagram", "Facebook", "TikTok", "Google Business"],
    toneWords: ["warm", "local-expert", "trustworthy"],
    angles: ["market updates", "just listed", "buyer education", "neighborhood love", "client wins"],
    sample: { name: "Hoxha Realty", handle: "@hoxharealty", initials: "H" },
    seedPosts: {
      tip: "Thinking of selling this spring? 🌷 Homes in our area are moving in 18 days on average. Here are 3 things I'd fix first to add real value 👇 #RealEstate #HomeSelling",
      video: "HOOK: \"Don't list your home until you do these 3 things.\" — [b-roll of front door] Walk through curb appeal, declutter, pro photos. CTA: \"DM me TOUR for my free pre-list checklist.\"",
      review: "This is why we do it. 🙏 Congrats to the family on their FIRST home — under asking and keys in hand. Ready to find yours? Let's talk. ⭐⭐⭐⭐⭐ #HappyClients",
      offer: "Free home valuation this month — no strings. 🏡 Find out what your home is really worth in today's market. Comment VALUE and I'll send it over. #HomeValue",
      seo: "Best neighborhoods for first-time buyers in [city] — updated for 2026. A quick guide to price, schools, and commute for each area. #FirstTimeBuyer",
    },
    reviewExample: {
      author: "Marcus T.",
      initials: "M",
      stars: 5,
      text: "Alban made our first home purchase feel easy. Answered every 11pm text and got us $12k under asking. Can't recommend enough.",
      generatedPost:
        "This is why we do it. 🙏 Huge congrats to Marcus & family on their FIRST home — $12k under asking and keys in hand. Ready to find yours? Let's talk. ⭐⭐⭐⭐⭐ #HappyClients #RealEstate",
    },
  },
  {
    id: "dentist",
    emoji: "🦷",
    label: "Dentist",
    audience: "dentists & dental practices",
    platforms: ["Instagram", "Facebook", "Google Business", "TikTok"],
    toneWords: ["friendly", "reassuring", "professional"],
    angles: ["oral-health tips", "new-patient offers", "myth busting", "team spotlights", "before & after"],
    sample: { name: "Bright Smile Dental", handle: "@brightsmile", initials: "B" },
    seedPosts: {
      tip: "Coffee lover? ☕ Your enamel feels you. 3 easy ways to keep your smile white without giving up your morning cup 👇 #DentalTips #HealthySmile",
      video: "HOOK: \"Your toothbrush is probably wrong.\" — [close up of brushing angle] Show 45° angle, 2 min, tongue. CTA: \"Book a cleaning — link in bio.\"",
      review: "Nervous about the dentist? You're in good hands here. 💙 Thank you for the kind words! New patients — your first cleaning is on us this month. ⭐⭐⭐⭐⭐ #GentleDentistry",
      offer: "New patients get their first cleaning free this month. 🦷✨ Book online in 60 seconds — we'll handle the rest. #NewPatientSpecial",
      seo: "Emergency dentist in [city] — what to do for a chipped tooth, and when to come in same-day. #EmergencyDentist",
    },
    reviewExample: {
      author: "Priya K.",
      initials: "P",
      stars: 5,
      text: "I've always hated the dentist and this office changed that. Gentle, no judgment, and my teeth have never looked better.",
      generatedPost:
        "Nervous about the dentist? You're not alone — and you're in good hands here. 💙 Thank you Priya for the kind words! New patients, your first cleaning is on us this month. ⭐⭐⭐⭐⭐ #GentleDentistry #BrightSmile",
    },
  },
  {
    id: "lawyer",
    emoji: "⚖️",
    label: "Law firm",
    audience: "attorneys & law firms",
    platforms: ["LinkedIn", "Facebook", "Instagram", "Google Business"],
    toneWords: ["authoritative", "clear", "reassuring"],
    angles: ["know your rights", "case results", "legal myths", "process explainers", "community"],
    sample: { name: "Reeves & Co. Law", handle: "@reeveslaw", initials: "R" },
    seedPosts: {
      tip: "In a car accident and the insurance company is already calling? 🛑 Do NOT give a recorded statement first. Here's what to do instead 👇 #KnowYourRights",
      video: "HOOK: \"The insurance adjuster is not your friend.\" — [talking head] 3 things never to say. CTA: \"Free consult — link in bio.\"",
      review: "Results that matter. ⚖️ Grateful for clients who trust us during the hardest moments. Injured? Your consultation is always free. ⭐⭐⭐⭐⭐ #ClientResults",
      offer: "Free case review this week. If you've been injured, you may be owed more than the first offer. Call or DM to schedule. #InjuryLaw",
      seo: "What to do after a car accident in [state] — a step-by-step guide to protect your claim. #CarAccident #LegalTips",
    },
    reviewExample: {
      author: "David L.",
      initials: "D",
      stars: 5,
      text: "After my accident I was lost. This team handled everything and got me 4x the initial offer. Professional and genuinely caring.",
      generatedPost:
        "Results that matter. ⚖️ Grateful for clients like David who trust us during the hardest moments — and thrilled we could secure 4x the initial offer. Injured? Your consultation is always free. ⭐⭐⭐⭐⭐ #InjuryLaw #ClientResults",
    },
  },
  {
    id: "medspa",
    emoji: "💆",
    label: "Med spa",
    audience: "med spas & aesthetics clinics",
    platforms: ["Instagram", "TikTok", "Facebook", "Google Business"],
    toneWords: ["elevated", "friendly", "confidence-building"],
    angles: ["treatment education", "myth busting", "seasonal offers", "results", "self-care"],
    sample: { name: "Lumière Aesthetics", handle: "@lumiereaesthetics", initials: "L" },
    seedPosts: {
      tip: "Botox myth: it makes you look \"frozen.\" 🧊 Not when it's done right. Here's what natural, subtle results actually look like 👇 #Botox #Aesthetics",
      video: "HOOK: \"POV: your first Botox appointment.\" — [soft b-roll] Walk through consult, comfort, timeline. CTA: \"Book your complimentary consult.\"",
      review: "Natural results, every time. ✨ Thank you for trusting us with your glow! New clients — your consult is complimentary this week. ⭐⭐⭐⭐⭐ #NaturalResults",
      offer: "Glow up for summer ☀️ Book any facial this month and get a complimentary LED add-on. Limited spots — link in bio. #SummerGlow",
      seo: "Botox vs. filler — which is right for you? A simple guide from our [city] aesthetics team. #Botox #Filler",
    },
    reviewExample: {
      author: "Ana R.",
      initials: "A",
      stars: 5,
      text: "Obsessed with my results. Natural, subtle, exactly what I asked for. The whole team made me feel so comfortable.",
      generatedPost:
        "Natural results, every time. ✨ Thank you Ana for trusting us with your glow! This is the kind of subtle, refreshed look we live for. New clients — your consult is complimentary this week. ⭐⭐⭐⭐⭐ #Aesthetics #NaturalResults",
    },
  },
  {
    id: "home",
    emoji: "🔧",
    label: "Home services",
    audience: "contractors & home service pros",
    platforms: ["Facebook", "Instagram", "Google Business", "TikTok"],
    toneWords: ["honest", "practical", "local"],
    angles: ["homeowner tips", "seasonal maintenance", "before & after", "emergency service", "honesty"],
    sample: { name: "Apex Plumbing & HVAC", handle: "@apexhomepros", initials: "A" },
    seedPosts: {
      tip: "That $8 part could've saved a $2,000 flood. 🚰 The one thing every homeowner should check under the sink this weekend 👇 #HomeTips #Plumbing",
      video: "HOOK: \"Your water heater is trying to warn you.\" — [point to unit] 3 sounds and what they mean. CTA: \"Same-day service — call us.\"",
      review: "Honest work, on time, every time. 🔧 No upsells, no surprises — just the job done right. Need same-day service? We've got you. ⭐⭐⭐⭐⭐ #HonestWork",
      offer: "AC tune-up special — $89 before the summer rush. 🥵 Beat the heat and the breakdown. Book this week. #HVAC #SummerReady",
      seo: "Why is my AC blowing warm air? 5 common causes for [city] homeowners — and which need a pro. #HVAC #HomeMaintenance",
    },
    reviewExample: {
      author: "Karen W.",
      initials: "K",
      stars: 5,
      text: "Showed up on time, fixed it fast, and didn't try to upsell me on things I didn't need. Finally, an honest company.",
      generatedPost:
        "Honest work, on time, every time. 🔧 Thank you Karen! No upsells, no surprises — just the job done right. Need same-day service? We've got you. ⭐⭐⭐⭐⭐ #HomeServices #HonestWork",
    },
  },
  {
    id: "fitness",
    emoji: "💪",
    label: "Fitness",
    audience: "gyms, trainers & studios",
    platforms: ["TikTok", "Instagram", "Facebook", "Google Business"],
    toneWords: ["motivating", "friendly", "no-nonsense"],
    angles: ["quick workouts", "form tips", "transformations", "join offers", "myth busting"],
    sample: { name: "Forge Strength Co.", handle: "@forgestrength", initials: "F" },
    seedPosts: {
      tip: "You don't need 2 hours in the gym. 3 compound moves, 30 minutes, 3x a week. Save this 👇 #FitnessTips #StrengthTraining",
      video: "HOOK: \"Stop doing 100 crunches.\" — [demo] Show 3 core moves that actually work. CTA: \"Free week pass — link in bio.\"",
      review: "Proof it works. 💪 Huge respect for showing up every single day. Ready to write your story? First month's 50% off. ⭐⭐⭐⭐⭐ #Transformation",
      offer: "New Year, new you? 🏋️ First month is 50% off + a free coaching session. Let's build the habit that actually sticks. #FitnessGoals",
      seo: "Best beginner gym routine for busy professionals in [city] — a simple 3-day plan. #FitnessTips #BeginnerWorkout",
    },
    reviewExample: {
      author: "Tyler B.",
      initials: "T",
      stars: 5,
      text: "Down 22 lbs in 3 months and stronger than I've ever been. The coaches actually care and keep you accountable.",
      generatedPost:
        "Proof it works. 💪 22 lbs down and stronger than ever — huge respect to Tyler for showing up every single day. Ready to write your story? First month's 50% off. ⭐⭐⭐⭐⭐ #Transformation #ForgeStrength",
    },
  },
];

export const CONTENT_TYPES: { id: ContentType; label: string; emoji: string; blurb: string }[] = [
  { id: "tip", label: "Tips & expertise", emoji: "💡", blurb: "Helpful, niche-specific tips people save and share." },
  { id: "video", label: "Short-video scripts", emoji: "🎬", blurb: "Ready-to-film Reels & TikTok scripts with a hook and shot list." },
  { id: "review", label: "Review spotlights", emoji: "⭐", blurb: "Google reviews auto-turned into branded, trust-building posts." },
  { id: "offer", label: "Offers & promos", emoji: "🎁", blurb: "Seasonal promos and specials written to convert." },
  { id: "seo", label: "Local SEO & GBP", emoji: "🔎", blurb: "Weekly Google Business posts and keyword-rich content to rank locally." },
];

export function getNiche(id: string): Niche | undefined {
  return NICHES.find((n) => n.id === id);
}
