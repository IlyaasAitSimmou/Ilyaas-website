/**
 * DetailSections: the structured part of a project write-up (plots, block
 * diagram, decisions). Content is the `sections` array in data/projects.ts.
 */

import { CHARTS } from "../data/flightCharts";
import type { DetailSection } from "../data/projects";
import LineChart from "./LineChart";
import RichText from "./RichText";
import styles from "./DetailSections.module.css";

const DetailSections = ({ sections }: { sections: DetailSection[] }) => (
  <>
    {sections.map((s) => (
      <section key={s.title} className={styles.section}>
        <h3 className={styles.title}>{s.title}</h3>

        {s.text?.map((t) => (
          <p key={t} className={styles.text}>
            <RichText text={t} strongClassName={styles.strong} />
          </p>
        ))}

        {s.busMap && (
          <div className={styles.map}>
            <div className={styles.hub}>{s.busMap.hub}</div>
            <ul className={styles.branches}>
              {s.busMap.branches.map((b) => (
                <li key={b.part} className={styles.branch}>
                  <span className={styles.bus}>{b.bus}</span>
                  <span className={styles.part}>
                    {b.part}
                    <span className={styles.note}>{b.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {s.chain && (
          <ol className={styles.chain}>
            {s.chain.map((c) => (
              <li key={c.label} className={styles.link}>
                {c.label}
                <span className={styles.note}>{c.note}</span>
              </li>
            ))}
          </ol>
        )}

        {s.bullets && (
          <ul className={styles.bullets}>
            {s.bullets.map((b) => (
              <li key={b} className={styles.bullet}>
                <RichText text={b} strongClassName={styles.strong} />
              </li>
            ))}
          </ul>
        )}

        {s.charts?.map((c) => (
          <div key={c.id}>
            <LineChart chart={CHARTS[c.id]} />
            {c.note && <p className={styles.chartNote}>{c.note}</p>}
          </div>
        ))}
      </section>
    ))}
  </>
);

export default DetailSections;
