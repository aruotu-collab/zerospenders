import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/db";

/** Admin access is locked to allowlisted emails only (aruotu@gmail.com). */
export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase() ?? null;

  if (!session?.user || !isAdminEmail(email)) {
    return null;
  }

  // Keep DB role in sync for the designated admin email.
  if (session.user.role !== "ADMIN" && session.user.id) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "ADMIN" },
    });
  }

  return session;
}
