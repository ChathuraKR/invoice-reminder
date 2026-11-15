import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvoiceForm from "@/components/InvoiceForm";
import { updateInvoice } from "@/app/action";

export const dynamic = "force-dynamic";

const d = (date: Date) => date.toISOString().slice(0, 10);

export default async function EditInvoice({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [inv, suppliers] = await Promise.all([
    prisma.invoice.findUnique({ where: { id } }),
    prisma.supplier.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!inv) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 px-4 py-10 text-slate-900">
      <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-indigo-900">
        Edit invoice
      </h1>
      <InvoiceForm
        action={updateInvoice.bind(null, id)}
        suppliers={suppliers}
        submitLabel="Save"
        defaults={{
          supplierId: inv.supplierId,
          invoiceNumber: inv.invoiceNumber,
          amount: inv.amount.toString(),
          invoiceDate: d(inv.invoiceDate),
          dueDate: d(inv.dueDate),
        }}
      />
    </main>
  );
}