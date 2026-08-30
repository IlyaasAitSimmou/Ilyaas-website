"use client";

import Image from "next/image";
import type { Project } from "../data/projects";
import styles from "./ProjectCard.module.css";

type Props = {
  project: Project;
  onOpen: (project: Project) => void;
};

const ProjectCard = ({ project, onOpen }: Props) => {
  const links = [
    project.demo && { label: "Live", href: project.demo },
    project.github && { label: "Source", href: project.github },
    project.devpost && { label: "Devpost", href: project.devpost },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <article className={styles.card}>
      {project.image && (
        <div
          className={styles.thumb}
          style={
            project.imageBackdrop ? { background: project.imageBackdrop } : undefined
          }
        >
          <Image
            src={project.image}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 420px"
            className={styles.thumbImg}
            style={{ objectFit: project.imageFit ?? "cover" }}
          />
        </div>
      )}

      <div className={styles.body}>
        <header className={styles.head}>
          <h3 className={styles.title}>
            {/* Spans the whole card via ::before, so the entire card is clickable
                while the link row below stays independently focusable. */}
            <button
              type="button"
              className={styles.titleBtn}
              onClick={() => onOpen(project)}
            >
              {project.title}
            </button>
          </h3>
          {project.year && <span className={styles.year}>{project.year}</span>}
        </header>

        <p className={styles.desc}>{project.blurb}</p>

        <ul className={styles.tags}>
          {project.tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              {tag}
            </li>
          ))}
        </ul>

        <div className={styles.footer}>
          <span className={styles.open} aria-hidden="true">
            View details
            <span className={styles.arrow}>→</span>
          </span>

          {links.length > 0 && (
            <ul className={styles.links}>
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {link.label}
                    <span className="srOnly"> — {project.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
