/* ==========================================================================
 * site.ts — index of the content files.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  WHERE DO I EDIT ...                                                     │
 * │                                                                          │
 * │  ... the headline, the paragraph under it, buttons,                      │
 * │      section titles, footer, form labels, page titles?  →  copy.ts       │
 * │                                                                          │
 * │  ... a project, its description, or its photo gallery?  →  projects.ts   │
 * │                                                                          │
 * │  ... my work experience?                                →  experiences.ts│
 * │                                                                          │
 * │  ... the little labels on the 3D circuit board?         →  board.ts      │
 * │                                                                          │
 * │  ... the list of languages/frameworks in "Stack"?       →  stack.ts      │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * This file only re-exports the others so that components have a single import
 * path. You shouldn't need to change anything here.
 * ========================================================================== */

export * from "./copy";
export * from "./board";
export * from "./projects";
export * from "./experiences";
export * from "./stack";

/** Kept for older imports — prefer `PERSON` from copy.ts. */
export { PERSON as CONTACT_DETAILS } from "./copy";
