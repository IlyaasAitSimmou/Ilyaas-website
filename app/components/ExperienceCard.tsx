"use client";

import Image from "next/image";
import type { Experience } from "../data/experiences";
import styles from "./ExperienceCard.module.css";

type Props = {
  experience: Experience;
  onOpen: (experience: Experience) => void;
};

const ExperienceCard = ({ experience, onOpen }: Props) => {
  return (
    <article className={styles.row}>
      <div className={styles.period}>{experience.period}</div>

      <div className={styles.main}>
        <div className={styles.titleLine}>
          {experience.logo && (
            <span className={styles.logoBox}>
              <Image
                src={experience.logo}
                alt=""
                width={20}
                height={20}
                className={styles.logo}
              />
            </span>
          )}
          <h3 className={styles.role}>
            <button
              type="button"
              className={styles.roleBtn}
              onClick={() => onOpen(experience)}
            >
              {experience.role}
            </button>
          </h3>
          <span className={styles.at}>·</span>
          <span className={styles.org}>{experience.organisation}</span>
        </div>

        <p className={styles.blurb}>{experience.blurb}</p>

        {experience.tags && experience.tags.length > 0 && (
          <ul className={styles.tags}>
            {experience.tags.map((tag, i) => (
              <li key={`${tag}-${i}`} className={styles.tag}>
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.side}>
        {experience.location && (
          <span className={styles.location}>{experience.location}</span>
        )}
        <span className={styles.open} aria-hidden="true">
          Details
          <span className={styles.arrow}>→</span>
        </span>
      </div>
    </article>
  );
};

export default ExperienceCard;
