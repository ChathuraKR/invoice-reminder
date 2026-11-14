"use client";
import { useState } from "react";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function EnableNotifications() {
  const [status, setStatus] = useState("");

  async function enable() {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return setStatus("Not supported in this browser");
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return setStatus("Permission denied");

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setStatus("Notifications enabled ✓");
    } catch (e) {
      console.error(e);
      setStatus("Failed, see console");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={enable} className="rounded border px-3 py-2">Enable desktop notifications</button>
      {status && <span className="text-sm text-gray-600">{status}</span>}
    </div>
  );
}