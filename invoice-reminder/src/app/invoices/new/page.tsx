import { prisma } from "@/lib/prisma";
import InvoiceForm from "@/components/InvoiceForm";
import { createInvoice } from "@/app/action";

export const dynamic = "force-dynamic";

export default async function NewInvoice() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 px-4 py-10 text-slate-900">
      <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-indigo-900">
        New invoice
      </h1>
      <InvoiceForm action={createInvoice} suppliers={suppliers} submitLabel="Create" />
    </main>
  );
}