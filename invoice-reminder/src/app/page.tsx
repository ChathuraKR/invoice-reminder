import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { markPaid } from "./action";
import DeleteButton from "@/components/DeleteButton";
import EnableNotifications from "@/components/EnableNotifications";

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;

const fmtDate = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "UTC" });
const fmtMoney = (n: unknown) =>
  Number(n).toLocaleString("sv-SE", { style: "currency", currency: "SEK" });

function dueBadge(daysLeft: number): { label: string; className: string } | null {
  if (daysLeft < 0) {
    return { label: "Overdue", className: "bg-red-100 text-red-700" };
  }
  if (daysLeft > 7) return null;
  if (daysLeft === 0) {
    return { label: "Due today", className: "bg-orange-100 text-orange-700" };
  }

  const label = `Due in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;
  if (daysLeft === 1) return { label, className: "bg-orange-100 text-orange-700" };
  if (daysLeft <= 3) return { label, className: "bg-amber-100 text-amber-700" };
  return { label, className: "bg-sky-100 text-sky-700" };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "unpaid" } = await searchParams;
  const paid = tab === "paid";

  const [invoices, unpaid] = await Promise.all([
    prisma.invoice.findMany({
      where: paid ? { paidAt: { not: null } } : { paidAt: null },
      orderBy: paid ? { paidAt: "desc" } : { dueDate: "asc" },
      include: { supplier: true },
    }),
    prisma.invoice.aggregate({
      where: { paidAt: null },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  // today's local date as UTC midnight, to match @db.Date values
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition ${
      active
        ? "bg-indigo-600 text-white shadow-sm"
        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/suppliers"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
            >
              🏢 Suppliers
            </Link>
            <EnableNotifications />
            <Link
              href="/invoices/new"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              + New invoice
            </Link>
          </div>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Total to be paid</p>
            <p className="mt-1 text-2xl font-semibold">
              {fmtMoney(unpaid._sum.amount ?? 0)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Unpaid invoices</p>
            <p className="mt-1 text-2xl font-semibold">{unpaid._count}</p>
          </div>
        </section>

        <nav className="mb-4 flex gap-2">
          <Link href="/?tab=unpaid" className={tabClass(!paid)}>
            To be paid
          </Link>
          <Link href="/?tab=paid" className={tabClass(paid)}>
            Paid
          </Link>
        </nav>

        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Invoice date</th>
                <th className="px-4 py-3">Due date</th>
                {paid && <th className="px-4 py-3">Paid on</th>}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((i) => {
                const daysLeft = Math.round((i.dueDate.getTime() - todayUtc) / DAY_MS);
                const badge = paid ? null : dueBadge(daysLeft);
                return (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{i.supplier.name}</td>
                    <td className="px-4 py-3 text-slate-600">{i.invoiceNumber}</td>
                    <td className="px-4 py-3 font-medium">{fmtMoney(i.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtDate(i.invoiceDate)}</td>
                    <td className="px-4 py-3">
                      <span className="mr-2">{fmtDate(i.dueDate)}</span>
                      {badge && (
                        <span
                          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      )}
                    </td>
                    {paid && (
                      <td className="px-4 py-3 text-green-700">
                        {i.paidAt && fmtDate(i.paidAt)}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!paid && (
                          <form action={markPaid.bind(null, i.id)}>
                            <button className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                              Mark as paid
                            </button>
                          </form>
                        )}
                        <Link
                          href={`/invoices/${i.id}/edit`}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
                        >
                          Edit
                        </Link>
                        <DeleteButton id={i.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Nothing here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}