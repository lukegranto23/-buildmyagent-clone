export type BoomerIndustry = {
  id: string;
  label: string;
  shortName: string;
  tagline: string;
  description: string;
  pains: string[];
  quickWins: string[];
  recommendedIntegrations: string[];
  defaultBusinessName: string;
  trustLanguage: string;
  analogEdge: string;
  preferredGreeting: string;
};

export type AgentRole = {
  id: string;
  label: string;
  summary: string;
  promise: string;
  deliverables: string[];
  discoveryQuestions: string[];
  scriptFramework: {
    opening: string;
    core: string;
    closing: string;
  };
};

export type ToneProfile = {
  id: string;
  label: string;
  description: string;
  phrases: string[];
  closers: string[];
};

export type SupportPackage = {
  id: string;
  label: string;
  description: string;
  deliverables: string[];
  proofPoint: string;
};

export type PricingConfig = {
  setup: number;
  retainer: number;
};

export type PlaybookTemplate = {
  id: string;
  name: string;
  category: string;
  headline: string;
  description: string;
  industryId: string;
  roleId: string;
  toneId: string;
  supportIds: string[];
  offerName: string;
  price: PricingConfig;
  notes?: string;
  agentName?: string;
};

export interface BlueprintInput {
  industryId: string;
  roleId: string;
  toneId: string;
  supportIds: string[];
  agentName: string;
  offerName: string;
  price: PricingConfig;
  ownerNotes?: string;
}

export interface BlueprintOutput {
  industry: BoomerIndustry;
  role: AgentRole;
  tone: ToneProfile;
  support: SupportPackage[];
  offerName: string;
  price: PricingConfig;
  tagline: string;
  description: string;
  quickWins: string[];
  deliverables: string[];
  recommendedIntegrations: string[];
  systemPrompt: string;
  salesScripts: {
    phone: string;
    sms: string;
    email: string;
    printBlurb: string;
  };
  talkingPoints: string[];
  handoffChecklist: string[];
}

export const boomerIndustries: BoomerIndustry[] = [
  {
    id: "dental",
    label: "Dental & Orthodontic Offices",
    shortName: "Dental",
    tagline: "Keep hygiene chairs packed and cancellations low.",
    description:
      "Family-focused practices with decades of patient relationships who still rely on ringing phones and reminder postcards.",
    pains: [
      "Long-term patients slip through the cracks when the front desk is swamped",
      "Voicemail piles up after-hours and during lunch breaks",
      "Short-notice cancellations leave hygienists idle",
    ],
    quickWins: [
      "Rescue cancellations with waitlist outreach under five minutes",
      "Confirm tomorrow's hygiene appointments with warm, personalized calls",
      "Collect 5-star Google reviews right after each visit",
    ],
    recommendedIntegrations: [
      "Phone-to-Text Bridge",
      "Google Calendar",
      "Dentrix / OpenDental",
      "Mailchimp",
    ],
    defaultBusinessName: "Heritage Family Dental",
    trustLanguage: "Remind callers we've cared for families in town for over 25 years.",
    analogEdge: "Offer to drop printed reminder cards in the mail for patients who ask.",
    preferredGreeting: "Thank you for calling Heritage Family Dental, this is {{agent_name}}. How can I make your visit easier today?",
  },
  {
    id: "home-services",
    label: "Home Services & Trades",
    shortName: "Home Services",
    tagline: "Answer every call and dispatch techs faster.",
    description:
      "HVAC, plumbing, roofing, and electrical crews built on referrals, door hangers, and repeat homeowners.",
    pains: [
      "Missed calls equal lost service revenue during peak season",
      "Technicians rely on office staff to juggle scheduling and paperwork",
      "Owners struggle to follow up on unsold estimates",
    ],
    quickWins: [
      "Answer middle-of-the-night emergencies with calm confidence",
      "Slot same-day maintenance calls using live availability",
      "Follow up on unsold estimates with financing reminders",
    ],
    recommendedIntegrations: [
      "Phone-to-Text Bridge",
      "Jobber / ServiceTitan",
      "QuickBooks",
      "Google Calendar",
    ],
    defaultBusinessName: "ComfortGuard Heating & Air",
    trustLanguage: "Sound like the dispatcher who's been with the crew since the 90s.",
    analogEdge: "Offer to mail fridge magnets and leave voicemail reminders for homeowners.",
    preferredGreeting: "ComfortGuard Heating & Air, this is {{agent_name}}. Tell me what's going on at the house and we'll get you handled.",
  },
  {
    id: "real-estate",
    label: "Real Estate & Mortgage Teams",
    shortName: "Real Estate",
    tagline: "Respond to every lead before they shop somewhere else.",
    description:
      "Relationship-driven agents, brokers, and loan officers balancing open houses, showings, and paperwork.",
    pains: [
      "Zillow and Realtor.com leads go cold overnight",
      "Expired listings need consistent nurturing",
      "Paperwork and follow-up eat into selling time",
    ],
    quickWins: [
      "Call new buyer leads inside 60 seconds with qualifying questions",
      "Schedule listing walkthroughs and appraisal appointments",
      "Send printed buyer packets or lender introductions on request",
    ],
    recommendedIntegrations: [
      "Follow Up Boss",
      "Google Calendar",
      "Mailchimp / Constant Contact",
      "Zoom / Calendly",
    ],
    defaultBusinessName: "Heritage Realty Group",
    trustLanguage: "Reference the team's decades of local expertise and repeat clients.",
    analogEdge: "Offer printed buyer packets and personal voicemails after each showing.",
    preferredGreeting: "You've reached Heritage Realty Group, this is {{agent_name}}. Are you calling about buying, selling, or refinancing?",
  },
  {
    id: "financial",
    label: "Financial Advisors & Insurance",
    shortName: "Financial",
    tagline: "Protect renewals and keep annual reviews booked.",
    description:
      "Boutique advisory and insurance firms serving multigenerational clients who expect white-glove service.",
    pains: [
      "Annual reviews slip because outbound calls fall behind",
      "Clients need compliance-friendly messaging",
      "Policy renewals and paperwork stall until the deadline",
    ],
    quickWins: [
      "Book annual reviews 60 days out with warm reminder calls",
      "Send compliance-approved recap emails after every touch",
      "Nudge beneficiaries and insurance paperwork without sounding pushy",
    ],
    recommendedIntegrations: [
      "Phone-to-Text Bridge",
      "Calendly",
      "Salesforce / Redtail",
      "Mailchimp",
    ],
    defaultBusinessName: "Legacy Wealth Advisors",
    trustLanguage: "Mention the fiduciary promise and decades of stewardship.",
    analogEdge: "Offer to mail printed statements and call spouses directly when requested.",
    preferredGreeting: "Legacy Wealth Advisors, this is {{agent_name}}. How can I support you with your plan today?",
  },
  {
    id: "senior-care",
    label: "Senior Care & Assisted Living",
    shortName: "Senior Care",
    tagline: "Reassure families and keep rooms filled without burning out staff.",
    description:
      "Independent and assisted living communities built on trust, tours, and family referrals.",
    pains: [
      "Inquiry calls go to voicemail when staff are on tours",
      "Families need compassionate follow-up and printed materials",
      "Move-in paperwork stalls without regular check-ins",
    ],
    quickWins: [
      "Answer every family inquiry with warmth and empathy",
      "Schedule tours and mail printed welcome packets",
      "Follow up weekly until move-in is complete",
    ],
    recommendedIntegrations: [
      "Phone-to-Text Bridge",
      "Calendly",
      "HubSpot / Microsoft Dynamics",
      "Mailchimp",
    ],
    defaultBusinessName: "Maple Grove Senior Living",
    trustLanguage: "Reassure families we treat every resident like our own parents.",
    analogEdge: "Offer mailed welcome packets and handwritten thank-you cards.",
    preferredGreeting: "Maple Grove Senior Living, this is {{agent_name}}. How can I support your family today?",
  },
];

export const agentRoles: AgentRole[] = [
  {
    id: "appointment-setter",
    label: "Front-Desk Appointment Setter",
    summary: "Answers every call with warmth, locks in appointments, and rescues cancellations before revenue is lost.",
    promise: "Keeps the owner's calendar full while sounding like the trusted office manager who's been there for decades.",
    deliverables: [
      "24/7 call answering with human warmth",
      "Cancellation rescue waitlist outreach",
      "Reminder calls, texts, and postcard requests",
      "Calendar syncing with existing systems",
    ],
    discoveryQuestions: [
      "Is this a new or returning client/patient?",
      "What service or concern should we prepare for?",
      "What day and time works best?",
      "What is the best callback number if we get disconnected?",
    ],
    scriptFramework: {
      opening: "Thanks for reaching out to {{business_name}}, this is {{agent_name}}. I'm here to make this simple for you.",
      core: "Let me grab a few quick details so I can reserve the right spot and get you taken care of.",
      closing: "You're confirmed for {{appointment_time}}. We'll send a friendly reminder and I'm here if anything comes up.",
    },
  },
  {
    id: "lead-warmer",
    label: "Lead Warmer & Follow-Up Specialist",
    summary: "Calls and texts new inquiries inside 60 seconds, warms them up, and hands hot leads back to the owner.",
    promise: "Pre-sells prospects with stories and social proof so owners only talk to people ready to move.",
    deliverables: [
      "Speed-to-lead calls and texts",
      "Lead qualification scorecard",
      "Voicemail + SMS nurture sequences",
      "Owner-ready handoff summaries",
    ],
    discoveryQuestions: [
      "How did you hear about us?",
      "What timeline are you considering?",
      "Have you worked with anyone else on this yet?",
      "What would make this a win for you?",
    ],
    scriptFramework: {
      opening: "Hi {{first_name}}, it's {{agent_name}} with {{business_name}}. Thank you for reaching out — I wanted to connect while your questions are fresh.",
      core: "Tell me a little about what you're hoping to accomplish so I can point you in the right direction.",
      closing: "I'll line up {{owner_name}} to step in next with exactly what you need and send over a quick summary while it's fresh.",
    },
  },
  {
    id: "review-booster",
    label: "5-Star Reputation Manager",
    summary: "Calls after each service to collect reviews, testimonials, and referrals without sounding pushy.",
    promise: "Turns happy customers into public proof that keeps Main Street businesses booked solid.",
    deliverables: [
      "Post-visit thank-you calls",
      "Automated review request sequences",
      "Issue escalation alerts",
      "Referral follow-up scripts",
    ],
    discoveryQuestions: [
      "How did everything go today?",
      "Is there anything we could have done better?",
      "Would you be comfortable sharing a quick review or testimonial?",
      "Who else in your circle would benefit from this service?",
    ],
    scriptFramework: {
      opening: "It's {{agent_name}} with {{business_name}} checking in to make sure we took great care of you.",
      core: "We live on word-of-mouth, so your honest feedback helps us keep serving families like yours.",
      closing: "I'll text you the simple review link — and if you think of anyone else, feel free to pass my name along.",
    },
  },
  {
    id: "vip-concierge",
    label: "VIP Client Concierge",
    summary: "Gives legacy clients a single point of contact for scheduling, milestones, and white-glove requests.",
    promise: "Protects renewals and referrals by making every long-term client feel like a VIP.",
    deliverables: [
      "Birthday and milestone outreach",
      "Proactive check-in calls",
      "Personalized scheduling support",
      "Handwritten note scripts",
    ],
    discoveryQuestions: [
      "How can we make this next visit special?",
      "Are there family members we should keep updated?",
      "Do you prefer phone, text, or mailed reminders?",
      "Any upcoming milestones we should prepare for?",
    ],
    scriptFramework: {
      opening: "Hi {{first_name}}, it's {{agent_name}} from {{business_name}}. I'm your personal concierge here to keep everything on track.",
      core: "Let me handle the logistics so you can just show up and enjoy the experience.",
      closing: "I'll send a quick recap in the format you prefer and I'm only a call away if anything changes.",
    },
  },
];

export const toneProfiles: ToneProfile[] = [
  {
    id: "warm",
    label: "Warm & Neighborly",
    description: "Sounds like the familiar voice that's been picking up the office line for decades.",
    phrases: [
      "We've taken care of families like yours for years.",
      "You're in good hands — we'll make this simple.",
      "We can still send reminders the old-fashioned way if you prefer.",
    ],
    closers: [
      "We appreciate you trusting us after all these years.",
      "We'll take care of everything just like always.",
    ],
  },
  {
    id: "confident",
    label: "Confident & Decisive",
    description: "Takes charge like a seasoned manager who knows exactly what needs to happen next.",
    phrases: [
      "Here's the next best step and I'll get it booked for you right now.",
      "We handle situations like this daily — let me quarterback it for you.",
      "Consider it done; I'll text you the confirmation as soon as it saves.",
    ],
    closers: [
      "You're on the schedule and we'll stay two steps ahead for you.",
      "Expect a summary from me shortly — we've got this handled.",
    ],
  },
  {
    id: "energetic",
    label: "High-Energy Promoter",
    description: "Brings upbeat energy that matches sales-driven teams who thrive on momentum.",
    phrases: [
      "This is exactly why our clients rave about us.",
      "Let me hook you up with a few bonuses while we're at it.",
      "I'll cheerlead the whole way so you never miss a beat.",
    ],
    closers: [
      "Can't wait to celebrate this win with you.",
      "You're on the VIP list — watch for the confirmation in just a second.",
    ],
  },
];

export const supportPackages: SupportPackage[] = [
  {
    id: "launch-kit",
    label: "Launch Kit (Print + Phone)",
    description: "Analog-friendly toolkit so Main Street teams adopt the agent Day 1.",
    deliverables: [
      "Printable talk track cheat sheet",
      "Counter cards promoting the new agent",
      "Owner intro email and voicemail scripts",
      "FAQ sheet for skeptical staff",
    ],
    proofPoint: "Makes it feel real for owners who still love paper binders.",
  },
  {
    id: "white-glove",
    label: "White Glove Handoff",
    description: "We run the kickoff meeting, configure the phone bridge, and stay on for the first week.",
    deliverables: [
      "Owner onboarding Zoom",
      "Phone bridge + calendar configuration",
      "First-week performance standups",
      "Escalation playbook",
    ],
    proofPoint: "Removes the tech friction that keeps boomer teams from launching.",
  },
  {
    id: "market-booster",
    label: "Marketplace Booster",
    description: "Ready-to-run promotions that drive immediate revenue with the new agent.",
    deliverables: [
      "Reactivation campaign email + letter",
      "Two voicemail drops with matching SMS",
      "Social + print flyer templates",
      "ROI tracker spreadsheet",
    ],
    proofPoint: "Shows tangible ROI in the first 30 days.",
  },
];

export const playbookTemplates: PlaybookTemplate[] = [
  {
    id: "dental-hygiene-hero",
    name: "Dental Hygiene Recall Hero",
    category: "Dental",
    headline: "Fill empty hygiene chairs with same-day friendly outreach.",
    description: "Perfect for family dentists who hate seeing hygienists wait around.",
    industryId: "dental",
    roleId: "appointment-setter",
    toneId: "warm",
    supportIds: ["launch-kit", "white-glove"],
    offerName: "Recall Retention Agent",
    price: { setup: 899, retainer: 597 },
    notes: "Includes printed recall card templates and review scripts.",
    agentName: "Heritage Hygiene Host",
  },
  {
    id: "home-services-estimate-closer",
    name: "Home Services Estimate Closer",
    category: "Home Services",
    headline: "Call every unsold estimate and close the loop with financing options.",
    description: "Ideal for HVAC and plumbing owners who lose track of follow-ups during rush season.",
    industryId: "home-services",
    roleId: "lead-warmer",
    toneId: "confident",
    supportIds: ["white-glove", "market-booster"],
    offerName: "Estimate Rescue Agent",
    price: { setup: 1049, retainer: 697 },
    notes: "Includes financing objection handling and voicemail drops.",
    agentName: "ComfortGuard Closer",
  },
  {
    id: "senior-care-family-concierge",
    name: "Senior Care Family Concierge",
    category: "Senior Care",
    headline: "Reassure families from inquiry to move-in with weekly touchpoints.",
    description: "Great for communities that pride themselves on compassionate communication.",
    industryId: "senior-care",
    roleId: "vip-concierge",
    toneId: "warm",
    supportIds: ["launch-kit", "market-booster"],
    offerName: "Family Assurance Agent",
    price: { setup: 1199, retainer: 747 },
    notes: "Comes with mailed welcome packet templates and empathy scripts.",
    agentName: "Maple Grove Concierge",
  },
];

export function getIndustry(industryId: string): BoomerIndustry {
  return boomerIndustries.find((industry) => industry.id === industryId) ?? boomerIndustries[0];
}

export function getRole(roleId: string): AgentRole {
  return agentRoles.find((role) => role.id === roleId) ?? agentRoles[0];
}

export function getTone(toneId: string): ToneProfile {
  return toneProfiles.find((tone) => tone.id === toneId) ?? toneProfiles[0];
}

export function getSupportPackage(supportId: string): SupportPackage | undefined {
  return supportPackages.find((support) => support.id === supportId);
}

export function buildDefaultAgentName(industryId: string, roleId: string) {
  const industry = getIndustry(industryId);
  const role = getRole(roleId);
  return `${industry.shortName} ${role.label}`;
}

export function buildDefaultOfferName(industryId: string, roleId: string) {
  const industry = getIndustry(industryId);
  const role = getRole(roleId);
  return `${industry.shortName} ${role.label} Playbook`;
}

function dedupe(values: string[]) {
  return Array.from(new Set(values));
}

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

export function generateBlueprint(input: BlueprintInput): BlueprintOutput {
  const industry = getIndustry(input.industryId);
  const role = getRole(input.roleId);
  const tone = getTone(input.toneId);
  const support = input.supportIds
    .map((supportId) => getSupportPackage(supportId))
    .filter((pkg): pkg is SupportPackage => Boolean(pkg));

  const quickWins = industry.quickWins.slice(0, 3);
  const deliverables = dedupe([
    ...role.deliverables,
    ...support.flatMap((pkg) => pkg.deliverables),
  ]);

  const talkingPoints = dedupe([
    industry.trustLanguage,
    tone.description,
    role.promise,
    ...support.map((pkg) => pkg.proofPoint),
  ]);

  const systemPrompt = [
    `You are ${input.agentName}, the ${role.label.toLowerCase()} for ${industry.defaultBusinessName}.`,
    tone.description,
    industry.trustLanguage,
    "Operating principles:",
    "- Sound like a seasoned professional who has served this community for decades.",
    "- Mirror the caller's preferred communication style (phone, text, or mailed follow-up).",
    "- Always confirm spelling of names, best callback number, and urgency.",
    "- Reference printed materials or mailed packets when it builds trust.",
    "- Escalate to the owner or human staff when requests involve pricing exceptions, legal advice, or emotional distress.",
    "Core workflow:",
    `- Greet callers with: "${industry.preferredGreeting.replace("{{agent_name}}", input.agentName)}"`,
    ...role.discoveryQuestions.map((question) => `- Ask: ${question}`),
    `- Summarize next steps and set clear expectations using phrases like: "${tone.closers[0]}"`,
    "- Log every interaction with date, time, and promised follow-up.",
    "After each call:",
    "- Send a concise recap via SMS or email (or note to mail) including appointment details and gratitude.",
    "- If the contact prefers print, queue a reminder card request for fulfillment.",
    input.ownerNotes ? `Notes from the owner: ${input.ownerNotes}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  const phoneScript = [
    industry.preferredGreeting.replace("{{agent_name}}", input.agentName),
    role.scriptFramework.core.replace("{{business_name}}", industry.defaultBusinessName).replace("{{agent_name}}", input.agentName),
    tone.phrases[0],
    role.scriptFramework.closing
      .replace("{{appointment_time}}", "{{confirmed_time}}")
      .replace("{{business_name}}", industry.defaultBusinessName)
      .replace("{{agent_name}}", input.agentName),
  ].join("\n\n");

  const smsScript = `Hi {{first_name}}, it's ${input.agentName} with ${industry.defaultBusinessName}. ${tone.phrases[1]} ${quickWins[0]}. Reply here or call ${industry.defaultBusinessName} if you need anything.`;

  const emailScript = [
    `Subject: ${input.offerName} next steps`,
    "\n",
    `Hi {{first_name}},`,
    "\n",
    `${tone.phrases[2]} I'm ${input.agentName}, your new point of contact at ${industry.defaultBusinessName}.`,
    `${role.summary} Here's what happens next:`,
    ...quickWins.map((win, index) => `${index + 1}. ${win}`),
    "\n",
    "Attached (or mailed) you'll also find the simple checklist we talked about.",
    tone.closers[0],
    "\n",
    `${input.agentName}`,
  ].join("\n");

  const printBlurb = `${input.offerName}: ${role.promise} ${industry.analogEdge}`;

  const handoffChecklist = dedupe([
    "Route phone line through AI agent bridge",
    "Sync calendars and availability windows",
    "Load top 50 customers/prospects for priority handling",
    ...support.flatMap((pkg) => pkg.deliverables.map((deliverable) => `Deliver: ${deliverable}`)),
  ]);

  const description = `${role.summary} for ${industry.label}. ${role.promise} Quick wins include ${quickWins.join(", ").toLowerCase()}.`;
  const tagline = `${input.offerName} • ${industry.tagline}`;

  return {
    industry,
    role,
    tone,
    support,
    offerName: input.offerName,
    price: input.price,
    tagline,
    description,
    quickWins,
    deliverables,
    recommendedIntegrations: industry.recommendedIntegrations,
    systemPrompt,
    salesScripts: {
      phone: phoneScript,
      sms: smsScript,
      email: emailScript,
      printBlurb,
    },
    talkingPoints,
    handoffChecklist,
  };
}

export function getTemplate(templateId: string): PlaybookTemplate | undefined {
  return playbookTemplates.find((template) => template.id === templateId);
}

export function generatePriceCopy(price: PricingConfig) {
  return `${formatCurrency(price.retainer)}/mo retainer • ${formatCurrency(price.setup)} onboarding`;
}


