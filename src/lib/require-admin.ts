import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase() ?? null;
  const role = session?.user?.role;

  if (!session?.user || (role !== "ADMIN" && !isAdminEmail(email))) {
    return null;
  }

  // Keep DB role in sync for the designated admin email.
  if (email && isAdminEmail(email) && role !== "ADMIN" && session.user.id) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "ADMIN" },
    });
  }

  return session;
}
