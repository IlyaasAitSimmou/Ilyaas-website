/* ==========================================================================
 * stack.ts — the "Stack" section: your tools, grouped.
 *
 * TO ADD A SKILL: add `{ name: "Thing", image: "/logos/thing.png" }` to a group.
 *   The image is optional — a skill with no logo just shows its name.
 * TO ADD A GROUP: copy a whole block and bump the `index`.
 * TO REORDER: move things around; the page follows this array.
 *
 * ABOUT `tone: "dark"`: a few logo files are solid black artwork on a
 * transparent background, so on this dark site they'd be invisible. Marking
 * them `tone: "dark"` flips them to white. Three.js, Flask and Next.js are the
 * only ones that need it out of the current set — if you add a logo and it
 * seems to vanish, that's the fix.
 * ========================================================================== */

export type Skill = {
  name: string;
  image?: string;
  tone?: "dark";
};

export type SkillGroup = {
  title: string;
  index: string;
  summary: string;
  skills: Skill[];
};

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: "Languages",
    index: "01",
    summary: "What I write day to day.",
    skills: [
      { name: "TypeScript", image: "/logos/Typescript.png" },
      { name: "Python", image: "/logos/Python.png" },
      { name: "C", image: "/logos/C.png" },
      { name: "C++", image: "/logos/C++.png" },
      { name: "JavaScript", image: "/logos/JavaScript.png" },
      { name: "HTML5", image: "/logos/HTML5.png" },
      { name: "CSS3", image: "/logos/CSS3.png" },
    ],
  },
  {
    title: "Embedded/Firmware & Hardware",
    index: "02",
    summary: "Hardware and Embedded Systems.",
    skills: [
      { name: "KiCad", image: "/logos/kicad.png" },
      { name: "CubeIDE/HAL", image: "/logos/stm32.png" },
      { name: "Teensy", image: "/logos/sparkfun.png" },
      { name: "Arduino", image: "/logos/arduino.png" },
    ],
  },
  {
    title: "Web Dev/Frameworks & Tooling",
    index: "03",
    summary: "How I build and ship software.",
    skills: [
      { name: "Next.js", image: "/logos/nextjs.png", tone: "dark" },
      { name: "React", image: "/logos/reactjs.png" },
      { name: "React Native", image: "/logos/reactnative.png" },
      { name: "Django", image: "/logos/django.png" },
      { name: "Flask", image: "/logos/flask.png", tone: "dark" },
      { name: "PostgreSQL", image: "/logos/postgresql.png" },
      { name: "MySQL", image: "/logos/mysql.png" },
      { name: "Git", image: "/logos/git.png" },
      { name: "OpenGL", image: "/logos/opengl.png" },
    ],
  },
  {
    title: "Data",
    index: "04",
    summary: "Data Analysis",
    skills: [
      { name: "Matplotlib", image: "/logos/matplotlib.png" },
      { name: "Numpy", image: "/logos/numpy.png" },
      { name: "SciPy", image: "/logos/scipy.png" },
      { name: "Numba", image: "/logos/numba.png" },
      { name: "scikit-learn", image: "/logos/scikitlearn.png" },
    ],
  },
];
