"use client";

import { useEffect, useSyncExternalStore } from "react";

import { readStoredReadingMode, storeReadingMode } from "./bus";

const EVENT = "signal:reading";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

const getSnapshot = () => document.documentElement.dataset.reading === "on";
const getServerSnapshot = () => false;

function setReading(on: boolean) {
  if (on) document.documentElement.dataset.reading = "on";
  else delete document.documentElement.dataset.reading;
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Modo lectura: apaga WebGL y movimiento. Es para quien solo quiere leer
 * (o para equipos modestos), y es la misma vista que el fallback sin WebGL.
 */
export function ReadingToggle() {
  const on = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (readStoredReadingMode()) setReading(true);
  }, []);

  const toggle = () => {
    storeReadingMode(!on);
    setReading(!on);
  };

  return (
    <button
      type="button"
      className="reading-toggle"
      aria-pressed={on}
      aria-label="Modo lectura"
      title="Modo lectura"
      onClick={toggle}
    >
      <span className="reading-toggle__box" aria-hidden="true" />
      <span className="reading-toggle__label">Modo lectura</span>
    </button>
  );
}
