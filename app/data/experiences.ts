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
    id: "TFRA",
    role: "SRAD Software & Electronics Lead",
    organisation: "Turner Fenton Rocketry Association",
    period: "2025 — 2026",
    location: "Brampton, Ontario, Canada",
    blurb: "Developed SRAD flight computer avionics for Turner Fenton's 2026 Launch Canada rocket, Goldeneye.",
    description:
      "Turner Fenton Rocketry is the only high school rocketry team that has competed directly with university teams in the Launch Canada Challenge. The organization focuses on the development of rocketry systems and fostering an environment of learning to empower the next generation of innovators in Canada's rapidly growing aerospace industry.",
    detail: [
      "I developed KRAKENBANE I, a 4-layer SMT STM32F407 data-acquisition flight computer, and built GUEPARD I, a 4-layer Teensy 4.0 pitot tube board deriving airspeed from dynamic pressure. Both are included in my projects section",
    ],
    highlights: [
      "Retrieved data from KRAKENBANE I yielded altitude calculations agreeing within 0.2% of Blue Raven and RRC3+ COTS altimeters. Velocity calculations agreed within 3% of the Blue Raven's value.",
      "Recovered data from GUEPARD I yielded velocity values of Mach 1.14–1.17 against the Blue Raven's 1.16",
    ],
    tags: ["PCB Design", "STM32", "SMT", "Firmware", "Avionics", "C", "kiCad", "Teensy 4.0", "C++"],
    gallery: [],
  },
  {
    id: "zebratech",
    role: "Software Engineering Intern",
    organisation: "Zebra Technologies",
    period: "Summer 2025",
    blurb: "",
    description: "I developed a wake-word detection mobile application that can run locally on Zebra devices.",
    detail: [
      "",
    ],
    highlights: [""],
    tags: ["Full-Stack Development for Mobile Apps"],
    gallery: [],
  },
];
