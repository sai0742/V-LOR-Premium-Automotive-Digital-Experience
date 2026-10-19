import { useState } from "react";
import { Arrow, Label } from "./Shared";
export default function Registry() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  return (
    <section className="section registry" id="registry">
      <Label>08 — The Véloré registry</Label>
      <h2>
        Good things take time.
        <br />
        <em>Be part of what comes next.</em>
      </h2>
      <p>
        Notes from the studio. New expressions. Stories from the long way.
        <br />
        An occasional letter for those who share our point of view.
      </p>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setStatus(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "success" : "error",
          );
        }}
      >
        <label className="sr-only" htmlFor="email">
          Your email address
        </label>
        <div className="email-row">
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus("idle");
            }}
            aria-invalid={status === "error"}
            aria-describedby="form-feedback registry-note"
            required
          />
          <button type="submit" data-magnetic>
            Join the registry <Arrow />
          </button>
        </div>
        <p id="form-feedback" role={status === "error" ? "alert" : "status"}>
          {status === "error"
            ? "Please enter a valid email address."
            : status === "success"
              ? "A lovely idea, noted. This is a demo — your email has not been sent, stored or subscribed."
              : ""}
        </p>
        <small id="registry-note">
          A concept experience. This demo validates only; no email is sent or
          stored.
        </small>
      </form>
    </section>
  );
}
