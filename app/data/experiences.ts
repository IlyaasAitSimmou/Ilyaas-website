/* ==========================================================================
 * experiences.ts — the "Experiences" tab next to Projects.
 *
 * ⚠️  THE THREE ENTRIES BELOW ARE PLACEHOLDERS.
 *     I don't know your actual roles, so I've left obvious dummy text rather
 *     than inventing history for you. Replace every field before publishing,
 *     or delete the entries you don't need.
 *
 * TO ADD ONE: copy a block, give it a unique `id`.
 * TO REORDER: move blocks — most recent first reads best.
 * TO REMOVE THE TAB ENTIRELY: leave this array empty (`export const
 *     EXPERIENCES: Experience[] = [];`) and the tab hides itself.
 *
 * `detail` is an array of paragraphs; `highlights` is a bulleted list.
 * ========================================================================== */

import type { GalleryImage } from "./projects";

export type Experience = {
  id: string;
  /** Job or position title — the bold line on the card. */
  role: string;
  /** Company, lab, team or club. */
  organisation: string;
  /** Free text, e.g. "Jun 2025 — Present" or "Summer 2024". */
  period: string;
  location?: string;
  /** One line, shown on the card. */
  blurb: string;
  /** A sentence or two at the top of the detail overlay. */
  description: string;
  /** Full write-up — one string per paragraph. */
  detail: string[];
  /** Bulleted achievements shown under the paragraphs. */
  highlights?: string[];
  tags?: string[];
  /** Optional logo shown on the card, e.g. "/logos/simad.png". */
  logo?: string;
  /** Optional photos, paged with the arrow keys in the overlay. */
  gallery?: GalleryImage[];
  /** Optional outbound link, e.g. the organisation's site. */
  link?: { label: string; href: string };
};

export const EXPERIENCES: Experience[] = [
  {
    id: "placeholder-1",
    role: "Your role here",
    organisation: "Organisation name",
    period: "2025 — Present",
    location: "City, Country",
    blurb: "One line describing what you did here — this shows on the card.",
    description:
      "A sentence or two of context: what the organisation does and what you were brought in to do.",
    detail: [
      "Replace this paragraph with what you actually worked on. Concrete beats vague — the system you built, the constraint you were designing against, the thing that was broken when you arrived.",
      "Add as many paragraphs as you like by adding more strings to this list.",
    ],
    highlights: [
      "A specific, measurable thing you achieved",
      "Another one — numbers land harder than adjectives",
      "A tool, system or process you introduced",
    ],
    tags: ["Skill", "Skill", "Skill"],
    gallery: [],
  },
  {
    id: "placeholder-2",
    role: "Your role here",
    organisation: "Organisation name",
    period: "Summer 2024",
    blurb: "One line describing what you did here.",
    description: "A sentence or two of context about the role.",
    detail: [
      "Replace this with the detail of the role. If it was a team, say what your slice of it was.",
    ],
    highlights: ["Something you shipped", "Something you learned the hard way"],
    tags: ["Skill", "Skill"],
    gallery: [],
  },
  {
    id: "placeholder-3",
    role: "Your role here",
    organisation: "Club, society or team",
    period: "2023 — 2024",
    blurb: "Leadership, competition or extracurricular engineering work.",
    description:
      "Good place for rocketry teams, robotics clubs, competition wins or societies you ran.",
    detail: [
      "Replace this with the detail. Competition results, what you were responsible for, how big the team was.",
    ],
    tags: ["Skill", "Skill"],
    gallery: [],
  },
];
