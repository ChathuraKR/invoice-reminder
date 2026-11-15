import { prisma } from "./prisma";

export type PushPayload = {
  title: string;
  body: string;
};

let configured = false;

async function getWebPush() {
  const mod = await import("web-push");
  const webpush = mod.default ?? mod;

  if (!configured) {
    const subject = process.env.VAPID_SUBJECT;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!subject || !publicKey || !privateKey) {
      throw new Error("Missing VAPID_SUBJECT / VAPID keys in .env");
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }

  return webpush;
}

function getStatusCode(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as { statusCode: unknown }).statusCode === "number"
  ) {
    return (error as { statusCode: number }).statusCode;
  }
  return undefined;
}

export async function sendPushToAll(payload: PushPayload): Promise<void> {
  const subs = await prisma.pushSubscription.findMany();
  if (subs.length === 0) return;

  const webpush = await getWebPush();

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
      } catch (error: unknown) {
        const status = getStatusCode(error);
        // subscription expired or revoked, so remove it
        if (status === 404 || status === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } });
        } else {
          console.error("push failed", status ?? error);
        }
      }
    })
  );
}