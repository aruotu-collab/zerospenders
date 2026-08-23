import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { ADMIN_EMAILS } from "../src/lib/admin";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(file: string) {
  const path = resolve(ROOT, file);
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const prisma = new PrismaClient();
const allowed = new Set(ADMIN_EMAILS.map((e) => e.toLowerCase()));

async function main() {
  const before = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  console.log("ADMINS before:", before.map((u) => u.email));

  const demoted = await prisma.user.updateMany({
    where: {
      role: "ADMIN",
      email: { notIn: [...allowed] },
    },
    data: { role: "MEMBER" },
  });
  console.log("Demoted:", demoted.count);

  for (const email of allowed) {
    await prisma.user.updateMany({
      where: { email },
      data: { role: "ADMIN" },
    });
  }

  const after = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  console.log("ADMINS after:", after.map((u) => u.email));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
