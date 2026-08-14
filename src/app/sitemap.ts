import type { MetadataRoute } from "next";
import { listSignals } from "@/lib/queries";

const site = "https://zerospenders.com";

const staticRoutes = [
  "",
  "/live",
  "/today",
  "/near-me",
  "/get-free",
  "/go-free",
  "/eat-free",
  "/learn-free",
  "/play-free",
  "/try-free",
  "/kids-free",
  "/online-free",
  "/creators",
  "/brands",
  "/join",
  "/watching",
  "/claimed",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${site}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/live" ? "hourly" : "daily",
    priority: path === "" ? 1 : path === "/live" ? 0.9 : 0.7,
  }));

  let signalEntries: MetadataRoute.Sitemap = [];
  try {
    const signals = await listSignals();
    signalEntries = signals.map((signal) => ({
      url: `${site}/signals/${signal.id}`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    }));
  } catch {
    // DB may be unavailable at build time in some environments
  }

  return [...staticEntries, ...signalEntries];
}
