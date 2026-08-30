"use client";

import React, { useState } from "react";
import { CONTACT_PAGE } from "../data/copy";
import styles from "./ContactForm.module.css";

/* Field labels and messages live in app/data/copy.ts under CONTACT_PAGE.form. */

type Status = "idle" | "sending" | "sent" | "error";

const ContactForm = () => {
  const t = CONTACT_PAGE.form;

  const fields = [
    { id: "name", label: t.name, type: "text", required: true, autoComplete: "name" },
    {
      id: "email",
      label: t.email,
      type: "email",
      required: true,
      autoComplete: "email",
    },
    {
      id: "phoneNumber",
      label: t.phone,
      type: "tel",
      required: false,
      autoComplete: "tel",
    },
    {
      id: "subject",
      label: t.subject,
      type: "text",
      required: true,
      autoComplete: "off",
    },
  ] as const;

  const [values, setValues] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  const update =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setFeedback("");

    try {
      const res = await fetch("/api/contact_emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (res.ok && data.accepted) {
        setStatus("sent");
        setFeedback(t.success);
        setValues({ name: "", email: "", phoneNumber: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setFeedback(data.message || t.failure);
      }
    } catch {
      setStatus("error");
      setFeedback(t.networkError);
    }
  };

  const sending = status === "sending";

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.grid}>
        {fields.map((field) => (
          <div
            key={field.id}
            className={`${styles.field} ${
              field.id === "subject" ? styles.spanFull : ""
            }`}
          >
            <label htmlFor={field.id} className={styles.label}>
              {field.label}
              {!field.required && <span className={styles.optional}>{t.optional}</span>}
            </label>
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              value={values[field.id]}
              onChange={update(field.id)}
              required={field.required}
              autoComplete={field.autoComplete}
              disabled={sending}
              className={styles.input}
            />
          </div>
        ))}

        <div className={`${styles.field} ${styles.spanFull}`}>
          <label htmlFor="message" className={styles.label}>
            {t.message}
          </label>
          <textarea
            id="message"
            name="message"
            value={values.message}
            onChange={update("message")}
            required
            rows={6}
            disabled={sending}
            className={`${styles.input} ${styles.textarea}`}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={sending}>
          {sending ? t.submitting : t.submit}
        </button>

        {/* Announced to screen readers when the request resolves. */}
        <p
          role="status"
          aria-live="polite"
          className={`${styles.feedback} ${status === "error" ? styles.error : ""} ${
            status === "sent" ? styles.success : ""
          }`}
        >
          {feedback}
        </p>
      </div>
    </form>
  );
};

export default ContactForm;
