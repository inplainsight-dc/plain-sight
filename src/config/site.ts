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
  mantra: "Reading the fine print so you don't have to.",

  // --- Person behind it --------------------------------------------------
  author: 'Philippa Hawker',
  location: 'Washington, DC',

  // --- Domain ------------------------------------------------------------
  // TODO: confirm registrable at a registrar, then keep astro.config.mjs `site` in sync.
  domain: 'inplainsight-dc.org',
  url: 'https://inplainsight-dc.org',

  // --- Links (shown in hero + footer) ------------------------------------
  // Intentionally blank for the initial launch — not ready to be contactable
  // or to expose repos for inspection/forking yet. Each link only renders if
  // it has a value, so blanks show nothing (no dead anchors). To re-enable
  // later, just fill any of these in:
  //   github:   'https://github.com/<handle-or-repo>'
  //   linkedin: 'https://www.linkedin.com/in/<handle>'
  //   email:    'hello@inplainsight-dc.org'  (set up forwarding first)
  links: {
    github: 'https://github.com/inplainsight-dc/plain-sight',
    linkedin: '',
    email: 'hello@inplainsight-dc.org',
  },

  // --- About (warm, first-person; edit freely) ---------------------------
  about: [
    "Hi, I'm Philippa! I work in government oversight. I spend my days reading the dense, fine-print documents that quietly run a city.",
    "In Plain Sight is where I share the tools I build to make that material usable. Not just laws and regulations, but procurement, programs, budgets, and the open data behind them. The rules that govern us should be readable by the people they govern.",
    "Everything here is built for the District, in the open, and mostly for the joy of it. The tools are made to be forked, so other cities can build their own. If something helps, breaks, or you just want to say hi, I'd love to hear from you!",
  ],
} as const;
