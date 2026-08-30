import Link from "next/link";
import { FOOTER, PERSON } from "../data/copy";
import styles from "./SiteFooter.module.css";

/* Footer text lives in app/data/copy.ts under FOOTER and PERSON. */

const SiteFooter = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.identity}>
            <span className={styles.name}>{PERSON.name}</span>
            <span className={styles.role}>{PERSON.role}</span>
          </div>

          <nav className={styles.cols} aria-label="Footer">
            <div className={styles.col}>
              <h2 className={styles.colTitle}>{FOOTER.siteColumnTitle}</h2>
              {FOOTER.siteLinks.map((link) => (
                <Link key={link.href} href={link.href} className={styles.colLink}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className={styles.col}>
              <h2 className={styles.colTitle}>{FOOTER.elsewhereColumnTitle}</h2>
              <a
                href={PERSON.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.colLink}
              >
                GitHub ↗
              </a>
              <a
                href={PERSON.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.colLink}
              >
                LinkedIn ↗
              </a>
              <a href={`mailto:${PERSON.email}`} className={styles.colLink}>
                Email ↗
              </a>
            </div>
          </nav>
        </div>

        <div className={styles.bottom}>
          <span className={styles.meta}>
            © {new Date().getFullYear()} {PERSON.name}
          </span>
          <span className={styles.meta}>{FOOTER.note}</span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
