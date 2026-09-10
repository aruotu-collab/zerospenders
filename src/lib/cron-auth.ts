/** Authorize Vercel Cron or Bearer CRON_SECRET calls. */
export function isCronAuthorized(request: Request) {
  // Vercel injects this header on scheduled cron invocations.
  if (request.headers.get("x-vercel-cron") === "1") {
    return true;
  }

  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
