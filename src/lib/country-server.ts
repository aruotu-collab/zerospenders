import { cookies } from "next/headers";
import {
  COUNTRY_COOKIE,
  DEFAULT_COUNTRY,
  resolveCountry,
  type CountryCode,
} from "@/lib/countries";

export async function getSelectedCountry(): Promise<CountryCode> {
  const jar = await cookies();
  return resolveCountry(jar.get(COUNTRY_COOKIE)?.value);
}
