import Image from "next/image";
import { STACK } from "../data/copy";
import { SKILL_GROUPS } from "../data/stack";
import styles from "./StackSection.module.css";

/* Heading text: app/data/copy.ts (STACK). Skill lists: app/data/stack.ts */

const StackSection = () => {
  return (
    <section className={styles.section} id="stack">
      <div className={styles.inner}>
        <div className={styles.head}>
          <span className={styles.index}>{STACK.index}</span>
          <h2 className={styles.title}>{STACK.title}</h2>
          <p className={styles.lede}>{STACK.lede}</p>
        </div>

        <div className={styles.groups}>
          {SKILL_GROUPS.map((group) => (
            <div key={group.title} className={styles.group}>
              <div className={styles.groupHead}>
                <span className={styles.groupIndex}>{group.index}</span>
                <h3 className={styles.groupTitle}>{group.title}</h3>
                <p className={styles.groupSummary}>{group.summary}</p>
              </div>

              <ul className={styles.chips}>
                {group.skills.map((skill) => (
                  <li key={skill.name} className={styles.chip}>
                    {skill.image && (
                      <span className={styles.logoBox}>
                        <Image
                          src={skill.image}
                          alt=""
                          width={22}
                          height={22}
                          className={styles.logo}
                          data-tone={skill.tone ?? "color"}
                        />
                      </span>
                    )}
                    <span className={styles.chipName}>{skill.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StackSection;
