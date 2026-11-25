/* ==========================================================================
 * copy.ts — EVERY piece of site-wide text lives here.
 *
 * If you want to reword something, this is the file. Nothing in this file is
 * code you need to understand: change the text inside the quote marks and save.
 *
 * Contents, in page order:
 *   PERSON ........ your name, role, email, social links
 *   META .......... browser tab title + search/social preview text
 *   NAV ........... top navigation bar
 *   HERO .......... the big opening headline, subheading and buttons
 *   VIEWER ........ text on/around the 3D circuit board
 *   WORK .......... the Projects / Experiences section heading + tabs
 *   STACK ......... the "Stack" section heading
 *   CONTACT ....... the contact call-to-action at the bottom of the homepage
 *   CONTACT_PAGE .. the separate /contact page and its form
 *   FOOTER ........ the site footer
 *
 * Project text lives in  projects.ts
 * Experience text lives in  experiences.ts
 * Circuit board labels live in  board.ts
 * Stack / skill lists live in  stack.ts
 * ========================================================================== */

export const PERSON = {
  name: "Ilyaas Ait Simmou",
  /** Shown under your name in the footer. */
  uni: "Computer Engineering @ University of Waterloo",
  role: "Computer Engineering @ University of Waterloo | PCB Design + Embedded Firmware",
  /**
   * Crest shown at the top-left of the nav. Any square image in `public/`
   * works; its display size is set by `.brandMark` in NavBar.module.css.
   */
  logo: "/logos/UW.png",
  email: "yaseenaitsimmou@gmail.com",
  github: "https://github.com/IlyaasAitSimmou",
  linkedin: "https://www.linkedin.com/in/ilyaas-ait-simmou-3a4539291/",
};

export const META = {
  /** Browser tab title for the homepage. */
  title: "Ilyaas Ait Simmou — Computer Engineer",
  /** Appended to other pages, e.g. "Contact · Ilyaas Ait Simmou". */
  titleTemplate: "%s · Ilyaas Ait Simmou",
  /** Used by Google and link previews. Keep it under ~155 characters. */
  description:
    "Ilyaas Ait Simmou — PCB design and embedded firmware. I design flight computers; two have flown on a supersonic rocket.",
  keywords: [
    "Ilyaas Ait Simmou",
    "embedded systems",
    "flight computer",
    "avionics",
    "STM32",
    "rocketry",
    "PCB design",
  ],
};

export const NAV = {
  skipToContent: "Skip to content",
  /** Add or remove entries freely. `href` starting with /# jumps to a section. */
  links: [
    { label: "Work", href: "/#work" },
    { label: "Stack", href: "/#stack" },
    { label: "Contact", href: "/#contact" },
  ],
  githubLabel: "GitHub",
  contactLabel: "Contact",
};

export const HERO = {
  /** Small pill above the headline. */
  eyebrow: "Ilyaas Ait Simmou",
  /** The big opening statement. */
  headline: "I design flight computers, and the software that flies on them.",
  /**
   * The paragraph under the headline.
   * `**text**` renders as brighter, emphasised text.
   */
  subhead:
    "PCB design and embedded firmware. I designed **KRAKENBANE I**, a data-acquisition flight computer, and **GUEPARD I**, a pitot tube board. Both flew on a supersonic rocket (Mach 1.16, 12,100+ ft) at Launch Canada 2026. Altitude agreed within 0.2% of the RRC3 altimeter, and the pitot read Mach 1.165.",
  primaryCta: { label: "View selected work", href: "#work" },
  secondaryCta: { label: "Get in touch", href: "/contact" },
};

export const VIEWER = {
  /** Header strip above the 3D board. */
  panelTitle: "KRAKENBANE I",
  panelSubtitle: "DAQ Flight Computer",
  /** Hint shown under the board once it has loaded. */
  dragHint: "Drag to rotate",
  labelsToggle: "Labels",
  loading: "Loading board geometry",
  errorMessage: "The board model could not be loaded.",
  unsupportedMessage: "3D preview needs WebGL, which this browser has disabled.",
  /** Read out by screen readers in place of the 3D view. */
  ariaLabel:
    "Interactive 3D model of the KRAKENBANE I DAQ V4.1 flight computer. Drag to rotate.",
};

export const WORK = {
  index: "01",
  title: "Selected work",
  lede: "Flight computer hardware, simulation and hackathon builds.",
  /** Labels for the two tabs above the grid. */
  projectsTab: "Projects",
  experiencesTab: "Experiences",
  /** Heading over the compact list under the featured cards. */
  otherTitle: "Other projects",
  /** Shown on a card to invite a click. */
  openLabel: "View details",
};

export const STACK = {
  index: "02",
  title: "Stack",
  lede: "The tools I reach for, grouped by where they sit in a project — from boards and HAL-based firmware up to the interface a user touches.",
};

export const CONTACT = {
  index: "03",
  title: "Building something that needs to work the first time?",
  lede: "I'm open to internships, collaborations and hardware projects. The fastest way to reach me is email.",
  primaryCta: { label: "Start a conversation", href: "/contact" },
};

export const CONTACT_PAGE = {
  metaTitle: "Contact",
  metaDescription:
    "Get in touch with Ilyaas Ait Simmou about PCB design, embedded firmware, or flight hardware.",
  index: "Contact",
  title: "Let's talk.",
  lede: "I'm open to internships, hardware collaborations and engineering work. Tell me what you're building and I'll get back to you.",
  /** Labels for the direct-contact list. */
  channels: {
    email: "Email",
    github: "GitHub",
    githubHandle: "IlyaasAitSimmou",
    linkedin: "LinkedIn",
    linkedinHandle: "Ilyaas Ait Simmou",
  },
  form: {
    name: "Name",
    email: "Email",
    phone: "Phone",
    subject: "Subject",
    message: "Message",
    optional: "optional",
    submit: "Send message",
    submitting: "Sending…",
    success: "Message sent. I'll get back to you shortly.",
    failure: "That didn't send. Please try again.",
    networkError: "Network error — check your connection and try again.",
  },
};

export const FOOTER = {
  siteColumnTitle: "Site",
  elsewhereColumnTitle: "Elsewhere",
  siteLinks: [
    { label: "Work", href: "/#work" },
    { label: "Stack", href: "/#stack" },
    { label: "Contact", href: "/contact" },
  ],
  /** Small print on the bottom-right. */
  note: "DAQ V4.1 · rendered from CAD at 27 draw calls",
};
