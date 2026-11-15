import Link from "next/link";

type Defaults = { name?: string; email?: string | null; phone?: string | null };

export default function SupplierForm({
  action,
  defaults = {},
  submitLabel,
  title,
}: {
  action: (fd: FormData) => void | Promise<void>;
  defaults?: Defaults;
  submitLabel: string;
  title: string;
}) {
  const wrap = "relative mt-1";
  const icon =
    "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base";
  const input =
    "w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";
  const label = "block text-sm font-semibold text-slate-700";

  return (
    <form
      action={action}
      className="w-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200"
    >
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-5 text-white">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-emerald-100">
          Suppliers appear in the dropdown when you create an invoice.
        </p>
      </div>

      <div className="flex flex-col gap-5 p-6">
        <label className={label}>
          Company name
          <div className={wrap}>
            <span className={icon}>🏢</span>
            <input
              name="name"
              required
              defaultValue={defaults.name}
              placeholder="e.g. Acme AB"
              className={input}
            />
          </div>
        </label>

        <label className={label}>
          Email <span className="font-normal text-slate-400">(optional)</span>
          <div className={wrap}>
            <span className={icon}>✉️</span>
            <input
              name="email"
              type="email"
              defaultValue={defaults.email ?? ""}
              placeholder="billing@acme.se"
              className={input}
            />
          </div>
        </label>

        <label className={label}>
          Phone <span className="font-normal text-slate-400">(optional)</span>
          <div className={wrap}>
            <span className={icon}>📞</span>
            <input
              name="phone"
              defaultValue={defaults.phone ?? ""}
              placeholder="+46 ..."
              className={input}
            />
          </div>
        </label>

        <div className="flex items-center gap-3">
          <button className="flex-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98]">
            {submitLabel}
          </button>
          <Link
            href="/suppliers"
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-300 hover:bg-slate-100"
          >
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}