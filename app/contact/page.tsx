import type { Metadata } from "next";
import ContactForm from "../components/ContactForm";
import { CONTACT_PAGE, PERSON } from "../data/copy";
import styles from "./contact.module.css";

/* All text on this page lives in app/data/copy.ts under CONTACT_PAGE. */

export const metadata: Metadata = {
  title: CONTACT_PAGE.metaTitle,
  description: CONTACT_PAGE.metaDescription,
};

export default function ContactPage() {
  const { channels } = CONTACT_PAGE;

  const rows = [
    { label: channels.email, value: PERSON.email, href: `mailto:${PERSON.email}` },
    { label: channels.github, value: channels.githubHandle, href: PERSON.github },
    {
      label: channels.linkedin,
      value: channels.linkedinHandle,
      href: PERSON.linkedin,
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.intro}>
            <span className={styles.index}>{CONTACT_PAGE.index}</span>
            <h1 className={styles.title}>{CONTACT_PAGE.title}</h1>
            <p className={styles.lede}>{CONTACT_PAGE.lede}</p>

            <ul className={styles.channels}>
              {rows.map((row) => (
                <li key={row.label} className={styles.channel}>
                  <span className={styles.channelLabel}>{row.label}</span>
                  <a
                    href={row.href}
                    className={styles.channelValue}
                    target={row.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      row.href.startsWith("http") ? "noopener noreferrer" : undefined
                    }
                  >
                    {row.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.formSide}>
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
