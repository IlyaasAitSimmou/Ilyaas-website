/* ==========================================================================
 * projects.ts — every project, and everything shown when one is opened.
 *
 * HOW A PROJECT SHOWS UP IN TWO PLACES:
 *   1. As a card in the grid   → uses `title`, `blurb`, `tags`, `image`, `year`
 *   2. In the detail overlay   → uses `description`, `detail`, `gallery`, links
 *
 * TO ADD A PROJECT: copy an existing block, change the `id` to something unique.
 * TO REORDER: move blocks up or down — the grid follows this array's order.
 * TO ADD PHOTOS: drop files in `public/` and list them under `gallery`.
 *
 * `detail` is an array of paragraphs. Add or remove strings freely — each one
 * becomes its own paragraph in the overlay.
 * ========================================================================== */

export type GalleryImage = {
  /** Path inside `public/`, e.g. "/logos/rocketsim.png". */
  src: string;
  /** Optional line of text under the image. */
  caption?: string;
  /** "contain" shows the whole image; "cover" fills and crops. */
  fit?: "cover" | "contain";
  /** Background colour behind a "contain" image. */
  backdrop?: string;
};

export type Project = {
  id: string;
  title: string;
  /** One line, shown on the card. */
  blurb: string;
  /** A sentence or two, shown at the top of the detail overlay. */
  description: string;
  /** Full write-up. Each string is a paragraph. */
  detail: string[];
  /** Short labels on the card. Two to four works best. */
  tags: string[];
  /** Card thumbnail. */
  image?: string;
  imageFit?: "cover" | "contain";
  imageBackdrop?: string;
  /** Photos in the detail overlay, paged with the arrow keys. */
  gallery?: GalleryImage[];
  github?: string;
  devpost?: string;
  demo?: string;
  /** Your part in it — shown as a labelled row in the overlay. */
  role?: string;
  year?: string;
  /** Marks the flight computer, which is the 3D model in the hero. */
  flagship?: boolean;
};

export const PROJECTS: Project[] = [
  {
    id: "krakenbane",
    title: "KRAKENBANE I",
    blurb: "Data acquisition STM32-based flight computer for a high-power model rocket. Flown at Launch Canada 2026",
    description:
      "A 4-layer avionics board I designed end to end: schematic, layout, assembly, and the firmware that runs on it.",
    detail: [
      "KRAKENBANE I is the flight computer you can rotate at the top of this page — the model is the real CAD export, not a stand-in.",
      "The board packs inertial and barometric sensing, a high-g accelerometer for the motor burn period, and removable microSD logging with onboard flash as a backup, into a 38 × 100 mm 4-layer stack-up. It also connects to a separate 42x70 mm 4-layer GNSS breakout board and an XBee Radio module for telemetry, via JST-GH modules.",
      // TODO(Ilyaas): this is the one project you know better than anyone —
      // expand on the design decisions, what failed, and what you'd change.
      "I took it from schematic capture through layout, assembly and bring-up, then wrote the firmware that runs on it.",
    ],
    tags: ["PCB Design", "STM32", "SMT", "Firmware", "Avionics", "C", "kiCad"],
    role: "Hardware design, layout and firmware",
    github: "https://github.com/IlyaasAitSimmou/krakenbane_one_pcb",
    year: "2026",
    flagship: true,
    // TODO(Ilyaas): add photos of the real board — bare PCB, assembled,
    // installed in the airframe, launch day. Drop them in `public/` first.
    image: "/logos/real.png",
    imageFit: "contain",
    gallery: [{ src: "/logos/daq3D.png", caption: "Main DAQ board 3D Model", fit: "contain" },
      { src: "/logos/GNSS3D.png", caption: "GNSS breakout board 3D model", fit: "contain" }, { src: "/logos/real.png", caption: "Main DAQ, GNSS breakout, and XBee module, side by side on their mounts (post-recovery)", fit: "contain" }, { src: "/logos/avbay.png", caption: "KRAKENBANE I mounted in avbay (post-recovery)", fit: "contain" }, { src: "/logos/krakenbane_one.png", caption: "Main DAQ board kiCad PCB layout", fit: "contain" }, { src: "/logos/GNSS.png", caption: "GNSS breakout board kiCad PCB layout", fit: "contain" }, { src: "/logos/daqschematic.png", caption: "Main DAQ board kiCad schematic", fit: "contain" }, { src: "/logos/GNSSschematic.png", caption: "GNSS breakout board kiCad schematic", fit: "contain" }],
  },
  {
    id: "guepardone",
    title: "GUEPARD I",
    blurb: "Custom Teensy 4.0 pitot tube flight computer for a high-power model rocket. Also flown at Launch Canada 2026",
    description:
      "Another 4-layer avionics board I designed end to end. This circular board acquires dynamic pressure by subtracting static and ram air pressure readings from its transducers. This is used to calculate velocity with ISA temperature fitted to conditions of the launch day.",
    detail: [
      "GUEPARD I",
      "The board packs ram air and static pressure transducers, a type-K thermocouple amplifier, and removable microSD logging with onboard flash as a backup, into a circular 80 mm 4-layer stack-up.",
      // TODO(Ilyaas): this is the one project you know better than anyone —
      // expand on the design decisions, what failed, and what you'd change.
      "I took it from schematic capture through layout, assembly and bring-up, then wrote the firmware that runs on it.",
    ],
    tags: ["PCB Design", "Teensy 4.0", "Firmware", "Avionics", "C++", "kiCad"],
    role: "Hardware design, layout and firmware",
    github: "https://github.com/IlyaasAitSimmou/guepard_one_pcb",
    year: "2026",
    flagship: true,
    // TODO(Ilyaas): add photos of the real board — bare PCB, assembled,
    // installed in the airframe, launch day. Drop them in `public/` first.
    image: "/logos/pitot3D.png",
    imageFit: "contain",
    gallery: [{ src: "/logos/pitot3D.png", caption: "Pitot Board 3D model - Some parts' 3D models are unavailable and not shown", fit: "contain" }, { src: "/logos/pitotpcb.png", caption: "Pitot Board pcb layout", fit: "contain" }, { src: "/logos/pitotschematic.png", caption: "Pitot board kiCad schematic", fit: "contain" }],
    },
  {
    id: "rocket-sim",
    title: "Rocket Flight Simulator",
    blurb: "Replays real model rocket flights in 3D from logged sensor data.",
    description:
      "A 3D simulator that reconstructs and replays model rocket flights from recorded sensor data, turning raw telemetry logs into a flight path you can inspect frame by frame.",
    detail: [
      "Flight data off a rocket is just a wall of numbers. This tool turns those logs back into something you can actually watch: the vehicle's path, attitude and altitude reconstructed in 3D and replayed on a timeline.",
      "It reads recorded sensor output and steps through the flight frame by frame, which makes it far easier to spot where a flight deviated from what the sensors expected.",
    ],
    tags: ["3D Visualisation", "Telemetry", "Simulation"],
    image: "/logos/rocketsim2.png",
    imageFit: "cover",
    gallery: [
      { src: "/logos/rocketsim2.png", caption: "Flight replay view", fit: "cover" },
      { src: "/logos/rocketsim.png", caption: "Trajectory and telemetry", fit: "cover" },
    ],
    github: "https://github.com/IlyaasAitSimmou/rocket_flight_sim",
    year: "2025",
  },
  {
    id: "numina",
    title: "Numina",
    blurb: "Turns any topic into a narrated math animation, with a live AI tutor.",
    description:
      "A web application that instantly turns any topic into a narrated math animation, paired with a live AI agent for personalized tutoring.",
    detail: [
      "Numina takes a topic a student is stuck on and generates a narrated animation explaining it, so the explanation is visual rather than a wall of text.",
      "A live AI agent sits alongside the animation to answer follow-up questions, which keeps the student in one place instead of bouncing between tabs.",
    ],
    tags: ["AI Agent", "Animation", "Full-stack"],
    image: "/logos/numina.png",
    imageFit: "contain",
    imageBackdrop: "#06101e",
    gallery: [
      { src: "/logos/numina.png", fit: "contain", backdrop: "#06101e" },
    ],
    github: "https://github.com/NimayDesai/Numina",
    devpost: "https://devpost.com/software/numina-a9vyu4",
    role: "Built with a team",
    year: "2025",
  },
  {
    id: "spendwise",
    title: "SpendWise",
    blurb: "Scans receipts to track spending and suggest cheaper alternatives.",
    description:
      "A web application that tracks and evaluates spending habits by scanning receipts, then suggests cheaper alternatives based on the user's location.",
    detail: [
      "SpendWise reads a photo of a receipt, pulls the line items out of it, and builds a picture of where someone's money is actually going.",
      "It then uses the user's location to point out cheaper places to buy the same things nearby, so the feedback is actionable rather than just a spending chart.",
    ],
    tags: ["Receipt OCR", "Geolocation", "Full-stack"],
    image: "/logos/spendwise.png",
    imageFit: "contain",
    imageBackdrop: "#ffffff",
    gallery: [
      { src: "/logos/spendwise.png", fit: "contain", backdrop: "#ffffff" },
    ],
    github: "https://github.com/aarnavshah12/SpendWise",
    devpost: "https://devpost.com/software/spendwise-4hqxyk",
    demo: "https://spend-wise-liart.vercel.app/",
    role: "Built with a team",
    year: "2025",
  },
  {
    id: "simad",
    title: "SIMAD Foundation",
    blurb: "Application portal and website for SIMAD, an engineering-competition nonprofit I co-founded — deployed over a year ago and still running. Note: the organization has been disbanded.",
    description:
      "I deployed a Django app on Vercel with Dropbox API document storage for applicant resumés; worked around free-tier Postgres limits and hourly OAuth expiry via scheduled token refresh. The website is still live and has been running for over a year.",
    detail: [
      "SIMAD was a non-profit organization I co-founded in high school with 3 other students. I focused on developing the organization's website and an applicant system using Django. During our period of operations, members of our executive team also contributed to the frontend of the website and are credited in its team section. Ultimately though, the rest of my team and I discontinued the project.",
    ],
    tags: ["Python", "Django", "Production", "Full-Stack", "Web Dev", "PostgreSQL", "Dropbox API"],
    image: "/logos/simadweb2.png",
    imageFit: "cover",
    gallery: [{ src: "/logos/simad.png", fit: "cover" }, { src: "/logos/simadweb2.png", fit: "cover" }],
    github: "https://github.com/IlyaasAitSimmou/simad_website",
    demo: "https://simad-website.vercel.app/",
    year: "2025",
  },
  {
    id: "upnotes",
    title: "upNotes.ai",
    blurb: "LLM note-taking tool that helps students practise and retain concepts.",
    description:
      "A full-stack, LLM-backed application that helps students take better notes, practise concepts, and improve their grades.",
    detail: [
      "upNotes.ai sits between a student's notes and the practice they need to actually retain the material — it reads what they've written and generates questions and explanations from it.",
      "The aim was to close the loop between note-taking and revision, which are usually two disconnected activities.",
    ],
    tags: ["LLM", "Full-stack", "EdTech"],
    image: "/logos/upnotesai.png",
    imageFit: "contain",
    imageBackdrop: "#0a0a0a",
    gallery: [
      { src: "/logos/upnotesai.png", fit: "contain", backdrop: "#0a0a0a" },
    ],
    github: "https://github.com/JinayD1/upNotes.ai",
    devpost: "https://devpost.com/software/placeholder-u0mvno",
    role: "Built with a team",
    year: "2025",
  },
  {
    id: "teentoolkit",
    title: "TeenToolkit",
    blurb: "AI toolkit for the financial, academic and social side of teen life.",
    description:
      "An AI-powered web application bundling tools that help teenagers with the financial, educational and social aspects of their daily lives.",
    detail: [
      "TeenToolkit collects a set of small AI-backed tools aimed at the practical problems teenagers actually run into — money, school and social situations — into a single application.",
      "Built for RecessHacks, with the scope deliberately kept to tools that could be finished and demoed properly.",
    ],
    tags: ["AI", "Web", "Product"],
    image: "/logos/teentoolkit.webp",
    imageFit: "cover",
    gallery: [{ src: "/logos/teentoolkit.webp", fit: "cover" }],
    github: "https://github.com/IlyaasAitSimmou/recess_hacks_project",
    devpost:
      "https://devpost.com/software/teentoolkit?ref_content=user-portfolio&ref_feature=in_progress",
    year: "2025",
  },
  {
    id: "classcade",
    title: "Classcade",
    blurb: "Google Classroom, gamified — student diligence drives player stats.",
    description:
      "A Google Classroom-style platform where learning is gamified: player stats improve as students stay diligent.",
    detail: [
      "Classcade reframes coursework as a game. Keeping up with assignments raises your character's stats, so the incentive to stay on top of work is built into the interface rather than bolted on.",
    ],
    tags: ["Gamification", "Full-stack", "EdTech"],
    github: "https://github.com/IlyaasAitSimmou/ClassCade",
    devpost: "https://devpost.com/software/classcade",
    year: "2025",
    gallery: [],
  },
  {
    id: "flappy-fitness",
    title: "Flappy Fitness",
    blurb: "Flappy Bird you control with real exercise, via computer vision.",
    description:
      "An exercise-controlled variant of Flappy Bird built with Pygame and OpenCV — body movement tracked through the webcam drives the game.",
    detail: [
      "Instead of tapping a key, you move. OpenCV tracks the player through the webcam and translates real exercise into the bird's flap, so playing the game means actually doing the reps.",
      "The game itself is built in Pygame, with the vision pipeline feeding it input events.",
    ],
    tags: ["OpenCV", "Pygame", "Computer Vision"],
    image: "/logos/flappyfitness.png",
    imageFit: "cover",
    gallery: [
      { src: "/logos/flappyfitness.png", caption: "In-game", fit: "cover" },
      { src: "/logos/flappyfitness2.png", caption: "Pose tracking", fit: "cover" },
    ],
    github: "https://github.com/aarnavshah12/Flappy-Fitness",
    devpost: "https://devpost.com/software/flappy-fitness-jzghs7",
    role: "Built with a team",
    year: "2024",
  },
  {
    id: "speechdoc",
    title: "SpeechDoc",
    blurb: "Two ML models inferring speaker traits and vocal impairment from audio.",
    description:
      "A machine learning project with a Streamlit front end, using two models to predict a speaker's gender from audio and whether their voice shows signs of impairment.",
    detail: [
      "SpeechDoc runs two models over a single audio clip: one predicts the speaker's gender, the other flags whether the voice shows signs of impairment.",
      "It's wrapped in a Streamlit app so the models can be tried on a real recording without touching any code.",
    ],
    tags: ["Machine Learning", "Streamlit", "Audio"],
    github: "https://github.com/IlyaasAitSimmou/SpeechDoc",
    demo: "https://speechdoc.streamlit.app/",
    year: "2024",
    gallery: [],
  },
  // {
  //   id: "portfolio",
  //   title: "This Website",
  //   blurb: "The site you're on — including the real-time 3D board viewer.",
  //   description:
  //     "Built with Next.js and TypeScript, with the flight computer above rendered live from its CAD export.",
  //   detail: [
  //     "The interesting part of this site is the board at the top. It's the genuine CAD export of the DAQ V4.1, which arrived as an 11.4 MB file split into 13,579 separate draw calls — completely unusable in a browser.",
  //     "Merging the geometry by material and compressing it with meshopt brought that down to 1 MB and 27 draw calls, which is what makes it render smoothly while you drag it around.",
  //   ],
  //   tags: ["Next.js", "TypeScript", "Three.js"],
  //   github: "https://github.com/IlyaasAitSimmou/Ilyaas-website",
  //   year: "2025",
  //   gallery: [],
  // },
];

export const FLAGSHIP_PROJECT = PROJECTS.find((p) => p.flagship)!;
