/* ==========================================================================
 * experiences.ts — the "Experiences" tab next to Projects.
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
    id: "waterloo-rocketry",
    role: "Team Member, Controls",
    organisation: "Waterloo Rocketry",
    period: "2026 — Present",
    location: "Waterloo, Ontario, Canada",
    blurb: "Working on power electronics for the canard-controlling board in KiCad. Developing motor driver firmware.",
    description: "Working on power electronics for the canard-controlling board in KiCad. Developing motor driver firmware.",
    detail: [],
    tags: ["KiCad", "PCB Design", "Firmware", "C"],
    gallery: [],
  },
  {
    id: "TFRA",
    role: "Former SRAD Software & Electronics Lead",
    organisation: "Turner Fenton Rocketry Association",
    period: "Feb 2025 — Aug 2026",
    location: "Brampton, Ontario, Canada",
    blurb: "Designed the student-built flight computers for Turner Fenton's 2026 Launch Canada rocket, Goldeneye.",
    description:
      "Turner Fenton Rocketry is the only high school rocketry team that has competed directly with university teams in the Launch Canada Challenge. The organization focuses on the development of rocketry systems and fostering an environment of learning to empower the next generation of innovators in Canada's rapidly growing aerospace industry.",
    detail: [
      "I designed KRAKENBANE I, a 4-layer SMT STM32F407 data-acquisition flight computer, and designed and built GUEPARD I, a 4-layer Teensy 4.0 pitot tube board. Both have full write-ups in the Projects tab.",
    ],
    highlights: [
      "KRAKENBANE I's peak altitude agreed within 0.2% of the RRC3 commercial altimeter.",
      "GUEPARD I's pitot tube measured Mach 1.165 against the Blue Raven's 1.16.",
    ],
    tags: ["PCB Design", "STM32", "SMT", "Firmware", "Avionics", "C", "KiCad", "Teensy 4.0", "C++"],
    gallery: [
      { src: "/projects/goldeneye-launch.jpg", caption: "Goldeneye lifting off at Launch Canada 2026", fit: "contain" },
    ],
  },
  {
    id: "zebratech",
    role: "Software Engineering Intern",
    organisation: "Zebra Technologies",
    period: "Summer 2025",
    blurb: "Built a voice command mobile app in React Native that runs entirely on-device.",
    description: "I developed a wake-word detection mobile application that can run locally on Zebra devices.",
    detail: [],
    highlights: [
      "Built in React Native to streamline use of company hardware devices.",
      "Runs fully offline on company devices.",
      "Presented the prototype to company executives.",
    ],
    tags: ["Full-Stack Development for Mobile Apps"],
    gallery: [],
  },
];
