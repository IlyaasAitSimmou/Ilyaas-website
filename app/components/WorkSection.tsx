"use client";

/**
 * WorkSection
 *
 * The Projects / Experiences tab bar and the grids underneath it. Projects is
 * selected by default. Clicking any card opens the shared DetailOverlay.
 *
 * Content comes from `data/projects.ts` and `data/experiences.ts`; the tab
 * labels and section heading come from `data/copy.ts`. If the experiences list
 * is empty the second tab hides itself.
 */

import { useCallback, useRef, useState } from "react";
import { WORK } from "../data/copy";
import { EXPERIENCES, type Experience } from "../data/experiences";
import { PROJECTS, type Project } from "../data/projects";
import DetailOverlay, { type DetailItem } from "./DetailOverlay";
import ExperienceCard from "./ExperienceCard";
import ProjectCard from "./ProjectCard";
import styles from "./WorkSection.module.css";

type Tab = "projects" | "experiences";

function projectToDetail(p: Project): DetailItem {
  const meta: DetailItem["meta"] = [];
  if (p.year) meta.push({ label: "Year", value: p.year });
  if (p.role) meta.push({ label: "Role", value: p.role });

  const links = [
    p.demo && { label: "Live site", href: p.demo },
    p.github && { label: "Source", href: p.github },
    p.devpost && { label: "Devpost", href: p.devpost },
  ].filter(Boolean) as DetailItem["links"];

  return {
    id: p.id,
    title: p.title,
    meta,
    description: p.description,
    paragraphs: p.detail,
    tags: p.tags,
    gallery: p.gallery ?? [],
    links,
  };
}

function experienceToDetail(e: Experience): DetailItem {
  const meta: DetailItem["meta"] = [{ label: "Period", value: e.period }];
  if (e.location) meta.push({ label: "Location", value: e.location });

  return {
    id: e.id,
    title: e.role,
    subtitle: e.organisation,
    meta,
    description: e.description,
    paragraphs: e.detail,
    highlights: e.highlights,
    tags: e.tags,
    gallery: e.gallery ?? [],
    links: e.link ? [e.link] : [],
  };
}

const WorkSection = () => {
  const [tab, setTab] = useState<Tab>("projects");
  const [selected, setSelected] = useState<DetailItem | null>(null);
  const tablistRef = useRef<HTMLDivElement>(null);

  const hasExperiences = EXPERIENCES.length > 0;

  const openProject = useCallback((p: Project) => {
    setSelected(projectToDetail(p));
  }, []);

  const openExperience = useCallback((e: Experience) => {
    setSelected(experienceToDetail(e));
  }, []);

  const close = useCallback(() => setSelected(null), []);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "projects", label: WORK.projectsTab, count: PROJECTS.length },
    ...(hasExperiences
      ? [
          {
            id: "experiences" as Tab,
            label: WORK.experiencesTab,
            count: EXPERIENCES.length,
          },
        ]
      : []),
  ];

  // Left/Right arrows move between tabs, per the ARIA tabs pattern.
  const onTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === tab);
    const nextIndex =
      e.key === "ArrowRight"
        ? (i + 1) % tabs.length
        : (i - 1 + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex].id;
    setTab(nextTab);
    tablistRef.current
      ?.querySelector<HTMLButtonElement>(`[data-tab="${nextTab}"]`)
      ?.focus();
  };

  return (
    <section className={styles.section} id="work">
      <div className={styles.inner}>
        <div className={styles.head}>
          <span className={styles.index}>{WORK.index}</span>
          <h2 className={styles.title}>{WORK.title}</h2>
          <p className={styles.lede}>{WORK.lede}</p>
        </div>

        {/* ------------------------------------------------------- tab bar */}
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Work categories"
          className={styles.tabs}
          onKeyDown={onTabKeyDown}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              data-tab={t.id}
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* -------------------------------------------------------- panels */}
        <div
          role="tabpanel"
          id="panel-projects"
          aria-labelledby="tab-projects"
          hidden={tab !== "projects"}
        >
          <ul className={styles.projectGrid}>
            {PROJECTS.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} onOpen={openProject} />
              </li>
            ))}
          </ul>
        </div>

        {hasExperiences && (
          <div
            role="tabpanel"
            id="panel-experiences"
            aria-labelledby="tab-experiences"
            hidden={tab !== "experiences"}
          >
            <div className={styles.experienceList}>
              {EXPERIENCES.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  onOpen={openExperience}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <DetailOverlay item={selected} onClose={close} />
    </section>
  );
};

export default WorkSection;
