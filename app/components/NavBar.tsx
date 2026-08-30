"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV, PERSON } from "../data/copy";
import styles from "./NavBar.module.css";

/* Link labels and destinations live in app/data/copy.ts under NAV. */

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape, stop the page scrolling behind the sheet.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    // Past the mobile breakpoint the sheet is hidden by CSS, so close it to
    // keep state and body scroll consistent.
    const onResize = () => {
      if (window.innerWidth > 880) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/" className={styles.brand} onClick={() => setMenuOpen(false)}>
          {/* Decorative: the adjacent name is the link's accessible label. */}
          <span className={styles.brandMark}>
            <Image
              src={PERSON.logo}
              alt=""
              width={88}
              height={88}
              className={styles.brandLogo}
              priority
            />
          </span>
          <span className={styles.brandName}>{PERSON.name} - {PERSON.uni} </span>
        </Link>

        <ul className={styles.links}>
          {NAV.links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.right}>
          <a
            href={PERSON.github}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ghost}
          >
            {NAV.githubLabel}
          </a>
          <Link href="/contact" className={styles.cta}>
            {NAV.contactLabel}
          </Link>
        </div>

        <button
          type="button"
          className={styles.burger}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={menuOpen ? styles.barTop : ""} />
          <span className={menuOpen ? styles.barBottom : ""} />
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`${styles.sheet} ${menuOpen ? styles.sheetOpen : ""}`}
        hidden={!menuOpen}
      >
        <ul className={styles.sheetLinks}>
          {NAV.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.sheetLink}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={PERSON.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sheetLink}
              onClick={() => setMenuOpen(false)}
            >
              {NAV.githubLabel} ↗
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default NavBar;
