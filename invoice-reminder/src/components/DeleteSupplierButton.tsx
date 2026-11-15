"use client";
import { deleteSupplier } from "@/app/action";

export default function DeleteSupplierButton({ id }: { id: string }) {
  return (
    <form
      action={deleteSupplier.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm("Delete this supplier?")) e.preventDefault();
      }}
    >
      <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 ring-1 ring-red-200 hover:bg-red-50">
        Delete
      </button>
    </form>
  );
}