"use client";

import { useEffect, useState } from "react";
import { subscribeToPush, unsubscribeFromPush } from "@/app/actions";

type Status =
  | "unsupported"
  | "checking"
  | "off"
  | "on"
  | "denied"
  | "working";

/**
 * VAPID keys are base64url; the Push API wants a raw ArrayBuffer. TS's DOM
 * lib is picky that this be backed by a real (non-shared) ArrayBuffer, which
 * `Uint8Array.from` doesn't guarantee, so it's built by hand.
 */
function urlBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return buffer;
}

/**
 * Offers to turn push notifications on (or off again) on this device. Shown
 * on the Today screen. Hides itself entirely if the browser can't do push at
 * all — notably Safari unless the app was added to the home screen first.
 */
export default function EnableNotifications() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    async function check() {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      ) {
        setStatus("unsupported");
        return;
      }

      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();
      setStatus(existing ? "on" : "off");
    }

    check().catch(() => setStatus("unsupported"));
  }, []);

  async function enable() {
    setStatus("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });

      await subscribeToPush(subscription.toJSON() as never);
      setStatus("on");
    } catch (err) {
      console.error("Meldingen inschakelen mislukt:", err);
      setStatus("off");
    }
  }

  async function disable() {
    setStatus("working");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await unsubscribeFromPush(subscription.endpoint);
        await subscription.unsubscribe();
      }
    } catch (err) {
      console.error("Meldingen uitschakelen mislukt:", err);
    } finally {
      setStatus("off");
    }
  }

  if (status === "checking" || status === "unsupported") return null;

  if (status === "on") {
    return (
      <p className="mb-6 text-center text-xs text-muted">
        🔔 Meldingen staan aan ·{" "}
        <button
          type="button"
          onClick={disable}
          className="underline underline-offset-2"
        >
          uitzetten
        </button>
      </p>
    );
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-border-soft bg-surface p-3">
      <span aria-hidden className="text-2xl leading-none">
        🔔
      </span>
      <div className="min-w-0 flex-1 text-sm">
        {status === "denied" ? (
          <p className="text-muted">
            Meldingen staan uit voor deze site. Zet ze aan bij de
            site-instellingen van je browser om herinneringen te krijgen.
          </p>
        ) : (
          <p className="text-muted">
            Zet meldingen aan om een seintje te krijgen als er iets te doen is.
          </p>
        )}
      </div>
      {status !== "denied" && (
        <button
          type="button"
          onClick={enable}
          disabled={status === "working"}
          className="min-h-11 shrink-0 rounded-lg bg-accent px-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {status === "working" ? "…" : "Aanzetten"}
        </button>
      )}
    </div>
  );
}
