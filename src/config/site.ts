/**
 * In Plain Sight — central brand + site config.
 *
 * This is the ONE place to change the brand, domain, social links, and About copy.
 * Everything on the site reads from here, so forks just edit this file.
 *
 * Fork naming convention (see FORKING.md):
 *   inplainsight-{jurisdiction}.org              e.g. inplainsight-baltimore.org
 *   inplainsight-{tool}-{jurisdiction}.org       e.g. inplainsight-citator-baltimore.org
 */

export const site = {
  // --- Brand -------------------------------------------------------------
  name: 'In Plain Sight',
  jurisdiction: 'DC',
  instanceName: 'In Plain Sight DC',
  tagline: 'Bringing the fine print into plain sight.',
  blurb:
    "Civic tools that make the fine print of DC government easier to read, search, trust, and work for you. Laws, budgets, contracts, programs, services, open data, with more always on the way.",
  mantra: "Reading the fine print so you don’t have to.",

  // --- Person behind it --------------------------------------------------
  author: 'Philippa Hawker',
  location: 'Washington, DC',

  // --- Domain ------------------------------------------------------------
  // TODO: confirm registrable at a registrar, then keep astro.config.mjs `site` in sync.
  domain: 'inplainsight-dc.org',
  url: 'https://inplainsight-dc.org',

  // --- Links (shown in hero + footer) ------------------------------------
  // Each link only renders if it has a value, so a blank shows nothing (no dead
  // anchors). Current state:
  //   github  — LIVE, public repo (an asset at a builder event: "fork it").
  //   email   — OFF. The domain has no MX/mail records, so hello@inplainsight-dc.org
  //             bounces. Removed 2026-08-03 so the site doesn't advertise a dead
  //             address. To turn back on: set up mail routing on the domain FIRST
  //             (e.g. Cloudflare Email Routing / a forwarder + MX records), verify
  //             a test send arrives, THEN put the address back here.
  //   linkedin— blank; add 'https://www.linkedin.com/in/<handle>' when you want it.
  links: {
    github: 'https://github.com/inplainsight-dc/plain-sight',
    linkedin: '',
    email: '',
  },

  // --- About (warm, first-person; edit freely) ---------------------------
  //
  // Phase 4 / decision D5, 2026-08-25. This used to be three paragraphs sitting
  // between the lead and the tools — 1.75 screens of scrolling on a phone before
  // the first thing a reader could use. It is now one line on the home page and a
  // standalone /about page.
  //
  // The ORDER on that page is the whole point: why this exists, then who builds it,
  // then how. Credentials arrive as the answer to “why should I trust these numbers”,
  // not as an introduction — an about page that opens with a résumé reads as
  // “know my name before you look at my work”. Equally, do not shrink them: reading
  // this material professionally is the reason a stranger should believe the figures,
  // and burying it is the failure mode of this rewrite, not its goal.

  // One line, on the home page, under the lead. Earns its place by compressing the
  // trust claim; the link carries anyone who wants the rest.
  aboutLine:
    "Every tool here is free, needs no account, and traces back to a public record.",
  aboutLinkText: "Why this exists, and who’s building it",

  about: {
    why: [
      "The rules that govern us should be readable by the people they govern.",
      "Mostly, they aren’t. The documents that decide how a city actually works — retention schedules, licensing rules, budget lines, procurement records, the regulations behind a permit — are public, and almost none of them are readable. Being technically available is not the same as being possible to use.",
      "That gap is where In Plain Sight lives. Every tool here takes one dense, official thing and turns it into something you can answer a question with.",
    ],
    who: [
      "Hi, I’m Philippa. I work in government oversight, and I spend my days reading the dense, fine-print documents that quietly run a city.",
      "That is why these tools start from the source material rather than from somebody’s summary of it. Every figure on this site traces back to a public record, and each tool tells you which one and when it was last checked. Where a number is a signal rather than a finding, it says so plainly, on the page, not in a footnote.",
      "In Plain Sight is where I share what I build. Not just laws and regulations, but procurement, programs, budgets, and the open data underneath them.",
    ],
    how: [
      "Everything here is built for the District, in the open, and mostly for the joy of it.",
      "The tools are free. Most need no account, no sign-in and no AI — what you type stays in your browser. There is no analytics and no tracking on this site, which is a deliberate trade: I would rather not know how many people visit than know who they are.",
      "The code is public and the tools are built to be forked, so another city can stand up its own. And where someone has already made a corner of DC legible, I link to their work instead of rebuilding it.",
    ],
  },
} as const;
