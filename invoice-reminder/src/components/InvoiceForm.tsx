import Link from "next/link";

type Defaults = {
  supplierId?: string;
  invoiceNumber?: string;
  amount?: string;
  invoiceDate?: string;
  dueDate?: string;
};

type SupplierOption = { id: string; name: string };

export default function InvoiceForm({
  action,
  defaults = {},
  submitLabel,
  suppliers,
}: {
  action: (fd: FormData) => void | Promise<void>;
  defaults?: Defaults;
  submitLabel: string;
  suppliers: SupplierOption[];
}) {
  const wrap = "relative mt-1";
  const icon =
    "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base";
  const input =
    "w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
  const label = "block text-sm font-semibold text-slate-700";

  return (
    <form
      action={action}
      className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200"
    >
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-5 text-white">
        <h2 className="text-lg font-semibold">Invoice details</h2>
        <p className="text-sm text-indigo-100">
          Fill in the details and set the due date to get a reminder.
        </p>
      </div>

      <div className="flex flex-col gap-5 p-6">
        <div>
          <label className={label}>
            Supplier company
            <div className={wrap}>
              <span className={icon}>🏢</span>
              <select
                name="supplierId"
                required
                defaultValue={defaults.supplierId ?? ""}
                className={input}
              >
                <option value="" disabled>
                  Select a supplier
                </option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <div className="mt-1.5 text-xs">
            {suppliers.length === 0 && (
              <span className="mr-1 text-amber-600">No suppliers yet.</span>
            )}
            <Link
              href="/suppliers"
              className="font-medium text-indigo-600 hover:underline"
            >
              + Add a new supplier
            </Link>
          </div>
        </div>

        <label className={label}>
          Invoice number
          <div className={wrap}>
            <span className={icon}>🧾</span>
            <input
              name="invoiceNumber"
              required
              defaultValue={defaults.invoiceNumber}
              placeholder="e.g. INV-2026-001"
              className={input}
            />
          </div>
        </label>

        <label className={label}>
          Amount
          <div className={wrap}>
            <span className={icon}>💰</span>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={defaults.amount}
              placeholder="0.00"
              className={input}
            />
          </div>
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className={label}>
            Invoice date
            <div className={wrap}>
              <span className={icon}>📅</span>
              <input
                name="invoiceDate"
                type="date"
                required
                defaultValue={defaults.invoiceDate}
                className={input}
              />
            </div>
          </label>

          <label className={label}>
            Due date
            <div className={wrap}>
              <span className={icon}>⏰</span>
              <input
                name="dueDate"
                type="date"
                required
                defaultValue={defaults.dueDate}
                className={`${input} border-amber-300 focus:border-amber-500 focus:ring-amber-100`}
              />
            </div>
          </label>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <button className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg active:scale-[0.98]">
            {submitLabel}
          </button>
          <Link
            href="/"
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-300 hover:bg-slate-100"
          >
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}