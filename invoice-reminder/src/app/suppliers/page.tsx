import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSupplier } from "../action";
import SupplierForm from "@/components/SupplierForm";
import DeleteSupplierButton from "@/components/DeleteSupplierButton";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  name: "Please enter a company name.",
  duplicate: "A supplier with that name already exists.",
  "in-use":
    "That supplier has invoices and can't be deleted. Delete or change those invoices first.",
};

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { invoices: true } } },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 text-slate-900">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-emerald-900">
            Suppliers
          </h1>
          <Link
            href="/"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
          >
            ← Back to invoices
          </Link>
        </header>

        {error && errors[error] && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {errors[error]}
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[22rem_1fr]">
          <SupplierForm
            action={createSupplier}
            title="New supplier"
            submitLabel="Add supplier"
          />

          <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Invoices</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.email ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{s.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {s._count.invoices}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/suppliers/${s.id}/edit`}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
                        >
                          Edit
                        </Link>
                        <DeleteSupplierButton id={s.id} />
                      </div>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                      No suppliers yet. Add your first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}