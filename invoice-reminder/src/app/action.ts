"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/* ---------- Invoices ---------- */

function parseInvoice(fd: FormData) {
  return {
    supplierId: String(fd.get("supplierId")),
    invoiceNumber: String(fd.get("invoiceNumber")).trim(),
    amount: String(fd.get("amount")),
    invoiceDate: new Date(String(fd.get("invoiceDate"))),
    dueDate: new Date(String(fd.get("dueDate"))),
  };
}

export async function createInvoice(fd: FormData) {
  await prisma.invoice.create({ data: parseInvoice(fd) });
  revalidatePath("/");
  redirect("/");
}

export async function updateInvoice(id: string, fd: FormData) {
  // reset reminderSentAt so a changed due date can trigger a new reminder
  await prisma.invoice.update({
    where: { id },
    data: { ...parseInvoice(fd), reminderSentAt: null },
  });
  revalidatePath("/");
  redirect("/");
}

export async function markPaid(id: string) {
  await prisma.invoice.update({ where: { id }, data: { paidAt: new Date() } });
  revalidatePath("/");
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/");
}

/* ---------- Suppliers ---------- */

function parseSupplier(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim();
  return { name, email: email || null, phone: phone || null };
}

export async function createSupplier(fd: FormData) {
  const data = parseSupplier(fd);
  if (!data.name) redirect("/suppliers?error=name");

  const exists = await prisma.supplier.findFirst({
    where: { name: { equals: data.name, mode: "insensitive" } },
  });
  if (exists) redirect("/suppliers?error=duplicate");

  await prisma.supplier.create({ data });
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function updateSupplier(id: string, fd: FormData) {
  const data = parseSupplier(fd);
  if (!data.name) redirect(`/suppliers/${id}/edit?error=name`);

  const exists = await prisma.supplier.findFirst({
    where: { id: { not: id }, name: { equals: data.name, mode: "insensitive" } },
  });
  if (exists) redirect(`/suppliers/${id}/edit?error=duplicate`);

  await prisma.supplier.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function deleteSupplier(id: string) {
  const used = await prisma.invoice.count({ where: { supplierId: id } });
  if (used > 0) redirect("/suppliers?error=in-use");

  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/suppliers");
  redirect("/suppliers");
}