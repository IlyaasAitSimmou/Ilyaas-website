import Link from "next/link";
import styles from "./homepage.module.css";
import BoardStage from "./components/BoardStage";
import RichText from "./components/RichText";
import StackSection from "./components/StackSection";
import WorkSection from "./components/WorkSection";
import { BOARD, CONTACT, HERO, PERSON, VIEWER } from "./data/site";

/* All text on this page comes from app/data/copy.ts — see app/data/site.ts. */

export default function Home() {
  return (
    <main>
      {/* ------------------------------------------------------------ hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.statusDot} aria-hidden="true" />
              {HERO.eyebrow}
            </p>

            <h1 className={styles.headline}>{HERO.headline}</h1>

            <p className={styles.subhead}>
              <RichText text={HERO.subhead} strongClassName={styles.strong} />
            </p>

            <div className={styles.ctaRow}>
              <Link href={HERO.primaryCta.href} className={styles.ctaPrimary}>
                {HERO.primaryCta.label}
              </Link>
              <Link href={HERO.secondaryCta.href} className={styles.ctaSecondary}>
                {HERO.secondaryCta.label}
              </Link>
            </div>

            <dl className={styles.specRow}>
              {BOARD.stats.map((s) => (
                <div key={s.label} className={styles.specItem}>
                  <dt className={styles.specLabel}>{s.label}</dt>
                  <dd className={styles.specValue}>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ----------------------------------------------- 3D board panel */}
          <div className={styles.boardPanel}>
            <header className={styles.boardHeader}>
              <span className={styles.boardTitle}>{VIEWER.panelTitle}</span>
              <span className={styles.boardMeta}>{VIEWER.panelSubtitle}</span>
            </header>

            <div className={styles.boardViewport}>
              <BoardStage />
            </div>

            <footer className={styles.boardFooter}>
              <span>{BOARD.dimensions}</span>
              <span className={styles.boardDivider} aria-hidden="true" />
              <span>{BOARD.layers}</span>
              <span className={styles.boardDivider} aria-hidden="true" />
              <span>Rev {BOARD.revision}</span>
            </footer>
          </div>
        </div>
      </section>

      {/* ------------------------------- projects + experiences (tabbed) */}
      <WorkSection />

      {/* ---------------------------------------------------------- stack */}
      <StackSection />

      {/* -------------------------------------------------------- contact */}
      <section className={styles.section} id="contact">
        <div className={styles.sectionInner}>
          <div className={styles.contactBlock}>
            <span className={styles.sectionIndex}>{CONTACT.index}</span>
            <h2 className={styles.contactTitle}>{CONTACT.title}</h2>
            <p className={styles.sectionLede}>{CONTACT.lede}</p>
            <div className={styles.ctaRow}>
              <Link href={CONTACT.primaryCta.href} className={styles.ctaPrimary}>
                {CONTACT.primaryCta.label}
              </Link>
              <a href={`mailto:${PERSON.email}`} className={styles.ctaSecondary}>
                {PERSON.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
