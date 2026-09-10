import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { getAdminStats } from "@/lib/admin-stats";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await requireAdmin();
  if (!session) redirect("/join?next=/admin");

  const stats = await getAdminStats(30);

  return <AdminDashboard email={session.user.email ?? ""} stats={stats} />;
}
