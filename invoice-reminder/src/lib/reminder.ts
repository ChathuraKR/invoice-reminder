import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { sendPushToAll } from "./push";

const DAY_MS = 86_400_000;

function whenText(daysLeft: number) {
  if (daysLeft < 0) {
    const n = Math.abs(daysLeft);
    return `OVERDUE by ${n} ${n === 1 ? "day" : "days"}`;
  }
  if (daysLeft === 0) return "due TODAY";
  return `due in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;
}

export async function runReminders() {
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  // "today + 2 days" as UTC midnight, to match @db.Date values
  const limit = new Date(todayUtc + 2 * DAY_MS);
  // local midnight: anything reminded before this was reminded on an earlier day
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const invoices = await prisma.invoice.findMany({
    where: {
      paidAt: null,
      dueDate: { lte: limit },
      OR: [{ reminderSentAt: null }, { reminderSentAt: { lt: startOfToday } }],
    },
    include: { supplier: true },
    orderBy: { dueDate: "asc" },
  });
  if (invoices.length === 0) return { sent: 0 };

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const daysLeft = (d: Date) => Math.round((d.getTime() - todayUtc) / DAY_MS);

  const rows = invoices
    .map((i) => {
      const left = daysLeft(i.dueDate);
      const text = whenText(left);
      const colored = left < 0 ? `<span style="color:#dc2626">${text}</span>` : text;
      return `<li><b>${i.supplier.name}</b> #${i.invoiceNumber}: ${i.amount} (${fmt(i.dueDate)}, ${colored})</li>`;
    })
    .join("");

  // Email first; if it throws, nothing is marked as sent and we retry on the next run
  await sendEmail(
    `Invoice reminder: ${invoices.length} unpaid invoice(s) need attention`,
    `<p>These unpaid invoices are due within 2 days or overdue:</p><ul>${rows}</ul>`
  );

  for (const i of invoices) {
    await sendPushToAll({
      title: `Invoice ${whenText(daysLeft(i.dueDate))}`,
      body: `${i.supplier.name} #${i.invoiceNumber}: ${i.amount}`,
    });
  }

  await prisma.invoice.updateMany({
    where: { id: { in: invoices.map((i) => i.id) } },
    data: { reminderSentAt: new Date() },
  });

  return { sent: invoices.length };
}