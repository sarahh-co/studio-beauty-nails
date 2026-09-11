"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import type { Selection } from "@/lib/quote";
import { instagramUrl } from "@/data/site";

const INITIAL_WINDOW_DAYS = 14; // today + 13 more days
const PAGE_DAYS = 14;
const MAX_OFFSET = 59; // 60 days total (offsets 0..59)

const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  weekday: "short",
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDayLabel(iso: string): string {
  return dayFormatter.format(new Date(iso));
}

export function formatTimeLabel(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

function todayInParis(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

type FetchState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "empty" }
  | { kind: "error"; message: string }
  | { kind: "too-long" };

type SlotPickerProps = {
  selection: Selection;
  selectedSlot: string | null;
  onSelectSlot: (iso: string) => void;
};

export default function SlotPicker({
  selection,
  selectedSlot,
  onSelectSlot,
}: SlotPickerProps) {
  const [slotsByDate, setSlotsByDate] = useState<Record<string, string[]>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [state, setState] = useState<FetchState>({ kind: "loading" });
  const [loadedThroughOffset, setLoadedThroughOffset] = useState(
    INITIAL_WINDOW_DAYS - 1
  );

  const abortRef = useRef<AbortController | null>(null);
  const todayRef = useRef(todayInParis());

  async function fetchRange(from: string, to: string, append: boolean) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ kind: "loading" });

    try {
      const response = await fetch("/api/creneaux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selection, from, to }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (controller.signal.aborted) return;

      if (!response.ok) {
        if (response.status === 422) {
          setState({ kind: "too-long" });
          return;
        }
        setState({
          kind: "error",
          message: data.error ?? "Une erreur est survenue.",
        });
        return;
      }

      const newSlots: Record<string, string[]> = data.slots ?? {};
      const merged = append ? { ...slotsByDate, ...newSlots } : newSlots;
      setSlotsByDate(merged);

      const availableDays = Object.keys(merged)
        .filter((date) => merged[date]?.length > 0)
        .sort();

      setState(availableDays.length > 0 ? { kind: "ready" } : { kind: "empty" });

      if (!append) {
        setSelectedDay(availableDays[0] ?? null);
      } else {
        setSelectedDay((prev) => prev ?? availableDays[0] ?? null);
      }
    } catch (e) {
      if (controller.signal.aborted) return;
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      setState({ kind: "error", message });
    }
  }

  useEffect(() => {
    const today = todayRef.current;
    setSlotsByDate({});
    setSelectedDay(null);
    setLoadedThroughOffset(INITIAL_WINDOW_DAYS - 1);
    fetchRange(today, addDays(today, INITIAL_WINDOW_DAYS - 1), false);

    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  function handleShowMoreDates() {
    const today = todayRef.current;
    const from = addDays(today, loadedThroughOffset + 1);
    const nextOffset = Math.min(loadedThroughOffset + PAGE_DAYS, MAX_OFFSET);
    const to = addDays(today, nextOffset);
    setLoadedThroughOffset(nextOffset);
    fetchRange(from, to, true);
  }

  function handleRetry() {
    const today = todayRef.current;
    setSlotsByDate({});
    setSelectedDay(null);
    setLoadedThroughOffset(INITIAL_WINDOW_DAYS - 1);
    fetchRange(today, addDays(today, INITIAL_WINDOW_DAYS - 1), false);
  }

  const availableDays = Object.keys(slotsByDate)
    .filter((date) => slotsByDate[date]?.length > 0)
    .sort();
  const timesForSelectedDay = selectedDay ? slotsByDate[selectedDay] ?? [] : [];
  const canShowMore = loadedThroughOffset < MAX_OFFSET;

  return (
    <div className="mt-10">
      <h2 className="mb-4 font-serif text-xl text-sauge-fonce">
        Choisissez votre créneau
      </h2>

      {state.kind === "too-long" && (
        <div>
          <p className="text-sauge-fonce">
            Durée trop longue pour la réservation en ligne
          </p>
          <Button
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            className="mt-3"
          >
            Me contacter
          </Button>
        </div>
      )}

      {state.kind === "error" && (
        <div>
          <p className="text-sm text-rose-profond">{state.message}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-sauge-clair px-4 text-sauge-fonce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
          >
            Réessayer
          </button>
        </div>
      )}

      {state.kind === "loading" && (
        <p className="text-sauge-fonce">Recherche des créneaux…</p>
      )}

      {state.kind === "empty" && (
        <div>
          <p className="text-sauge-fonce">
            Aucun créneau disponible sur cette période.
          </p>
          {canShowMore && (
            <button
              type="button"
              onClick={handleShowMoreDates}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-sauge-clair px-4 text-sauge-fonce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
            >
              Voir les dates suivantes
            </button>
          )}
        </div>
      )}

      {state.kind === "ready" && (
        <div>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {availableDays.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDay(date)}
                className={`min-h-11 shrink-0 rounded-full px-4 text-sm text-sauge-fonce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce ${
                  selectedDay === date
                    ? "border-2 border-sauge-fonce bg-white"
                    : "border border-sauge-clair bg-white"
                }`}
              >
                {formatDayLabel(date)}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {timesForSelectedDay.map((iso) => (
              <button
                key={iso}
                type="button"
                onClick={() => onSelectSlot(iso)}
                className={`min-h-11 rounded-lg px-2 text-sm text-sauge-fonce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce ${
                  selectedSlot === iso
                    ? "border-2 border-sauge-fonce bg-white"
                    : "border border-sauge-clair bg-white"
                }`}
              >
                {formatTimeLabel(iso)}
              </button>
            ))}
          </div>

          {canShowMore && (
            <button
              type="button"
              onClick={handleShowMoreDates}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-sauge-clair px-4 text-sauge-fonce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
            >
              Voir les dates suivantes
            </button>
          )}
        </div>
      )}
    </div>
  );
}
