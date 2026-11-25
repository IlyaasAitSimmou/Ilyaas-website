/* ==========================================================================
 * projects.ts — every project, and everything shown when one is opened.
 *
 * HOW A PROJECT SHOWS UP IN TWO PLACES:
 *   1. In the list             → `featured: true` gets a card with an image;
 *                                everything else is a row in "Other projects"
 *   2. In the detail overlay   → uses `description`, `detail`, `stats`,
 *                                `sections`, `gallery`, links
 *
 * TO ADD A PROJECT: copy an existing block, change the `id` to something unique.
 * TO REORDER: move blocks up or down — the grid follows this array's order.
 * TO ADD PHOTOS: drop files in `public/` and list them under `gallery`.
 *
 * `detail` is an array of paragraphs. Add or remove strings freely — each one
 * becomes its own paragraph in the overlay.
 * ========================================================================== */

import type { ChartId } from "./flightCharts";

/** A titled block in the overlay. Every field but `title` is optional. */
export type DetailSection = {
  title: string;
  /** Paragraphs. `**text**` renders brighter. */
  text?: string[];
  bullets?: string[];
  /** Block diagram: one hub with a labelled bus to each part. */
  busMap?: {
    hub: string;
    branches: { bus: string; part: string; note: string }[];
  };
  /** Left-to-right chain of boxes, e.g. a power path. */
  chain?: { label: string; note: string }[];
  /** Plots. Data: flightCharts.ts (built by scripts/build_flight_charts.py). */
  charts?: { id: ChartId; note?: string }[];
};

export type GalleryImage = {
  /** Path inside `public/`, e.g. "/projects/krakenbane-board.jpg". */
  src: string;
  /** Optional video, e.g. "/projects/demo.mp4". `src` becomes its poster. */
  video?: string;
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
  /** Button text for `demo`. Defaults to "Live site". */
  demoLabel?: string;
  /** Your part in it — shown as a labelled row in the overlay. */
  role?: string;
  year?: string;
  /** Gets a full card. Without it the project is a compact row. */
  featured?: boolean;
  /** Prize, shown next to the title. */
  award?: string;
  /** Headline numbers at the top of the overlay. */
  stats?: { label: string; value: string }[];
  /** Longer structured write-up, under `detail`. */
  sections?: DetailSection[];
};

export const PROJECTS: Project[] = [
  {
    id: "krakenbane",
    title: "KRAKENBANE I",
    blurb:
      "STM32F407 data-acquisition flight computer. Flew to 12,100+ ft at Launch Canada 2026, within 0.2% of the reference altimeter.",
    description:
      "A 4-layer SMT data-acquisition board that I designed, laid out and brought up. JLCPCB fabricated and assembled the main board.",
    detail: [
      "It logs a 6-axis IMU, a high-g accelerometer and a barometer to microSD and onboard flash, on a 38 × 100 mm board. GNSS sits on its own 42 × 70 mm 4-layer breakout, connected by a JST-GH harness. The model you can rotate at the top of this page is the real CAD export.",
      "The C firmware is built on ST's HAL library. It steps through pad, ascent and descent modes and logs faster once it detects launch.",
    ],
    featured: true,
    stats: [
      { label: "Peak altitude", value: "12,154 ft" },
      { label: "RRC3 reference", value: "12,132 ft" },
      { label: "Peak boost logged", value: "27.6 g" },
      { label: "Battery endurance", value: "6+ hours" },
    ],
    sections: [
      {
        title: "Flight results",
        bullets: [
          "**Altitude within 0.2%.** Processed peak altitude was 12,116 to 12,154 ft depending on the processing method, against 12,132 ft from the RRC3 commercial altimeter.",
          "**The high-g accelerometer earned its place.** The LSM6DSV32X was configured for ±16 g and sat at full scale from 0.01 to 1.79 s. The ADXL375 recorded the rest of the burn, up to 27.6 g.",
          "**Both memories came back with the flight.** microSD held the full 26 minutes from power-on; the SPI flash held the same flight from 6.7 s before liftoff to landing.",
          "**Velocity is the weaker result.** The IMU-based peak came out between Mach 1.10 and 1.13, about 3 to 6% under the 1.165 measured by GUEPARD I's pitot tube.",
        ],
        charts: [
          { id: "krakenAltitude" },
          {
            id: "krakenBoost",
            note: "Values as logged by the firmware. The flat top is the IMU at its ±16 g limit.",
          },
          {
            id: "krakenMemories",
            note: "The two traces lie on top of each other because they are the same samples, read back from separate chips.",
          },
        ],
      },
      {
        title: "Block diagram and bus map",
        text: [
          "Every sensor has its own I²C bus, so a fault on one can't take down the others. I split them up after advice from Arbalest. Storage follows the same rule, with one SPI bus each.",
        ],
        busMap: {
          hub: "STM32F407VGT6",
          branches: [
            { bus: "I²C1", part: "LSM6DSV32X", note: "6-axis IMU, interrupt line to the MCU" },
            { bus: "I²C2", part: "MS5607", note: "Barometer, 10 to 1200 mbar" },
            { bus: "I²C3", part: "ADXL375", note: "±200 g accelerometer" },
            { bus: "SPI1", part: "microSD", note: "Primary log, 33 Ω series resistors" },
            { bus: "SPI2", part: "W25Q64 flash", note: "8 MB backup log" },
            { bus: "UART4", part: "SAM-M10Q GNSS", note: "Breakout board, with time pulse and reset lines" },
            { bus: "USART2", part: "XBee connector", note: "RTS/CTS flow control" },
          ],
        },
      },
      {
        title: "Power path",
        chain: [
          { label: "2S LiPo", note: "7.4 V nominal" },
          { label: "XT30", note: "Power input" },
          { label: "SS34", note: "Reverse-polarity diode" },
          { label: "AP63203", note: "Buck converter" },
          { label: "3.3 V", note: "Ferrite-filtered 3.3 V analog rail" },
        ],
        text: ["Ran for more than six hours on one battery in an endurance test before launch."],
      },
      {
        title: "Design decisions",
        bullets: [
          "**A second accelerometer for the motor burn.** The IMU gives fine resolution and the ±200 g ADXL375 covers what it can't reach.",
          "**Flash alongside the microSD card.** A soldered chip can't be shaken out of a socket, so it backs up the card against vibration.",
          "**Crystal load capacitors sized from ST's AN2867.** The 16 MHz crystal uses 10 pF on each side.",
          "**GNSS on its own board.** The antenna gets a clean ground plane away from the switching regulator and radio.",
        ],
      },
      {
        title: "What I'd change",
        bullets: [
          "Use locking connectors in place of hot-glued JST-GH.",
          "Get the XBee telemetry working. The link did not work in flight, so all the data came from onboard storage.",
          "Set the IMU to its ±32 g range, so it stays on scale through a similar burn.",
        ],
      },
    ],
    tags: ["PCB Design", "STM32", "SMT", "Avionics", "C", "KiCad"],
    role: "Hardware design, layout, bring-up and HAL-based firmware",
    github: "https://github.com/IlyaasAitSimmou/krakenbane_one_pcb",
    year: "2026",
    image: "/projects/krakenbane-board.jpg",
    imageFit: "cover",
    gallery: [
      { src: "/projects/krakenbane-board.jpg", caption: "Main board before the panel rails were snapped off", fit: "contain" },
      { src: "/logos/daq3D.png", caption: "Main DAQ board 3D model", fit: "contain" },
      { src: "/projects/goldeneye-launch.jpg", caption: "Goldeneye lifting off at Launch Canada 2026", fit: "contain" },
      { src: "/projects/krakenbane-mounted.jpg", caption: "KRAKENBANE I on its avionics mount (post-recovery)", fit: "contain" },
      { src: "/projects/gnss-breakout.jpg", caption: "GNSS breakout board on its mount (post-recovery)", fit: "contain" },
      { src: "/projects/xbee-mount.jpg", caption: "XBee module and antenna on their mount (post-recovery)", fit: "contain" },
      { src: "/logos/avbay.png", caption: "KRAKENBANE I in the avionics bay (post-recovery)", fit: "contain" },
      { src: "/logos/krakenbane_one.png", caption: "Main DAQ board KiCad layout", fit: "contain" },
      { src: "/logos/daqschematic.png", caption: "Main DAQ board KiCad schematic", fit: "contain" },
      { src: "/logos/GNSS3D.png", caption: "GNSS breakout board 3D model", fit: "contain" },
      { src: "/logos/GNSS.png", caption: "GNSS breakout board KiCad layout", fit: "contain" },
      { src: "/logos/GNSSschematic.png", caption: "GNSS breakout board KiCad schematic", fit: "contain" },
    ],
  },
  {
    id: "guepardone",
    title: "GUEPARD I",
    blurb:
      "Teensy 4.0 pitot tube flight computer. Measured Mach 1.165 at Launch Canada 2026, against the Blue Raven's 1.16.",
    description:
      "A circular 4-layer board that measures airspeed from a pitot tube in the nosecone. It was the board the team's experiment depended on.",
    detail: [
      "Two absolute pressure transducers read ram and static air pressure. Their ratio gives Mach number, with no air temperature needed.",
      "I designed the 85 mm board in KiCad, assembled it by hand from through-hole parts and 1206 passives, and brought it up. The C++ firmware runs on the Teensy and logs to microSD and onboard flash.",
    ],
    featured: true,
    stats: [
      { label: "Peak, pitot", value: "Mach 1.165" },
      { label: "Peak, Blue Raven", value: "Mach 1.16" },
      { label: "Board", value: "85 mm, 4-layer" },
    ],
    sections: [
      {
        title: "Flight results",
        bullets: [
          "**Mach 1.165 from the pitot tube**, matching the 1.16 reported by the Blue Raven commercial altimeter.",
          "Supersonic for about 1.4 s.",
        ],
        charts: [{ id: "guepardMach" }],
      },
      {
        title: "Bus map",
        busMap: {
          hub: "Teensy 4.0",
          branches: [
            { bus: "Soft SPI", part: "HSCDANN060PASA5", note: "Ram air, 0 to 60 psi absolute, through a level shifter" },
            { bus: "Soft SPI", part: "HSCDANN1.6BASA5", note: "Static, 0 to 1.6 bar absolute, through a level shifter" },
            { bus: "SPI", part: "microSD", note: "Records from power-on" },
            { bus: "SPI", part: "W25Q64 flash", note: "Records from launch" },
          ],
        },
      },
      {
        title: "Design decisions",
        bullets: [
          "**Pressure sensors on software SPI, on their own pins.** Hardware SPI stays dedicated to storage, so a slow card write never blocks a pressure reading.",
          "**A one-time launch trigger off ram-air pressure.** It starts the flash log, so the 8 MB chip isn't spent on pad time. A drop in static pressure backs it up if the probe is blocked.",
          "**A TSR 1-2450 switching regulator.** It drops in where a linear regulator would go and runs without a heatsink.",
          "**The thermocouple was dropped before flight.** The board has an amplifier footprint for one, but it couldn't go into the pitot tube without risking damage, and Mach doesn't need it.",
        ],
      },
    ],
    tags: ["PCB Design", "Teensy 4.0", "Pitot tube", "Avionics", "C++", "KiCad"],
    role: "Hardware design, layout, assembly, bring-up and firmware",
    github: "https://github.com/IlyaasAitSimmou/guepard_one_pcb",
    year: "2026",
    image: "/logos/pitot3D.png",
    imageFit: "contain",
    gallery: [
      { src: "/logos/pitot3D.png", caption: "Pitot board 3D model. Some parts have no 3D model and are not shown", fit: "contain" },
      { src: "/logos/pitotpcb.png", caption: "Pitot board KiCad layout", fit: "contain" },
      { src: "/logos/pitotschematic.png", caption: "Pitot board KiCad schematic", fit: "contain" },
    ],
  },
  {
    id: "gravitylearn",
    title: "GravityLearn",
    blurb:
      "Finds a fuel-efficient ascent for a Kerbal Space Program rocket with a physics simulator, then flies it.",
    description:
      "An ascent autopilot for Kerbal Space Program. It searches a physics simulation of the rocket for an efficient pitch schedule, then flies the result in the game over kRPC.",
    detail: [
      "The optimizer runs during the flight itself, while the rocket is still climbing vertically off the pad.",
    ],
    featured: true,
    sections: [
      {
        title: "How it works",
        bullets: [
          "**RK4 physics simulation** with gravity, Mach-dependent drag, planetary rotation, and atmosphere data sampled from the game through kRPC.",
          "**Numba-compiled inner loop**, fast enough to simulate thousands of full ascents mid-flight.",
          "**SciPy differential evolution** optimizing a cubic pitch-versus-altitude schedule.",
        ],
        charts: [
          { id: "gravityPitch" },
          {
            id: "gravityApoapsis",
            note: "One flight from 27 July 2026. The flown apoapsis settled at 80.35 km against an 80 km target. The flight log starts about 11 s after pitch-over.",
          },
        ],
      },
    ],
    tags: ["Python", "Numba", "SciPy", "kRPC", "Simulation"],
    github: "https://github.com/IlyaasAitSimmou/GravityLearn",
    demo: "https://drive.google.com/file/d/1-ZniaLMHsyDil0PJB-yr0JkCMxqOIzeU/view?usp=sharing",
    demoLabel: "Demo video",
    year: "2026",
    image: "/projects/gravitylearn-ascent.jpg",
    imageFit: "cover",
    gallery: [
      {
        src: "/projects/gravitylearn-ascent.jpg",
        video: "/projects/gravitylearn-demo.mp4",
        caption: "Launch to orbit on the optimized pitch program, at 2× speed. Cut to the in-game footage",
        fit: "contain",
      },
    ],
  },
  {
    id: "controll",
    title: "ContROLL",
    blurb:
      "Raspberry Pi 5 car with computer vision, driven remotely from a repurposed Hack the North badge.",
    description:
      "A computer-vision car built at Hack the North 2026. I collaborated with a team and did all the hardware wiring on the Pi 5 car.",
    detail: [
      "The car runs gearmotors through an L298 motor driver and streams its camera feed to the controller's screen. The controller is the event's ESP32 hacker badge, repurposed as a remote.",
    ],
    featured: true,
    tags: ["Raspberry Pi 5", "ESP32", "Motor control", "Wiring"],
    role: "All hardware wiring, built with a team",
    year: "2026",
    devpost: "https://devpost.com/software/controll-vj37bq",
    image: "/projects/controll-car.jpg",
    imageFit: "cover",
    gallery: [
      { src: "/projects/controll-car.jpg", caption: "The car: Raspberry Pi 5, L298 motor driver and gearmotors", fit: "contain" },
      { src: "/projects/controll-badge.jpg", caption: "The Hack the North badge showing the car's live camera feed", fit: "contain" },
      { src: "/projects/controll-car-rear.jpg", caption: "Rear view, with the Pi and its power bank", fit: "contain" },
    ],
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
    award: "Best Finance Hack, GenAI Genesis 2025",
    role: "Built with a team",
    year: "2025",
  },
  {
    id: "classcade",
    title: "Classcade",
    blurb: "Backend for a gamified classroom platform: accounts, classes, assignments and marking.",
    description:
      "A classroom platform where staying on top of coursework raises a player's stats, built with a team at RecessHacks 2024.",
    detail: [
      "I built the backend: email verification, creating and joining classrooms, posting materials and assessments, student submissions and teacher marking, stored in MySQL.",
    ],
    award: "Best Innovation, RecessHacks 2024",
    tags: ["Backend", "MySQL", "Full-stack"],
    role: "Backend, built with a team",
    github: "https://github.com/IlyaasAitSimmou/ClassCade",
    devpost: "https://devpost.com/software/classcade",
    year: "2024",
    gallery: [],
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

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
export const OTHER_PROJECTS = PROJECTS.filter((p) => !p.featured);
