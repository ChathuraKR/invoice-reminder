import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateSupplier } from "@/app/action";
import SupplierForm from "@/components/SupplierForm";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  name: "Please enter a company name.",
  duplicate: "A supplier with that name already exists.",
};

export default async function EditSupplier({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-10 text-slate-900">
      <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-emerald-900">
        Edit supplier
      </h1>
      {error && errors[error] && (
        <div className="mx-auto mb-4 max-w-md rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {errors[error]}
        </div>
      )}
      <div className="mx-auto max-w-md">
        <SupplierForm
          action={updateSupplier.bind(null, id)}
          title="Supplier details"
          submitLabel="Save"
          defaults={supplier}
        />
      </div>
    </main>
  );
}