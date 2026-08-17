export const COUNTRY_COOKIE = "zs-country";

/** Markets with the densest FREE / sample / trial culture, UK first. */
export const COUNTRIES = [
  { code: "GB", name: "UK" },
  { code: "US", name: "USA" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "IE", name: "Ireland" },
  { code: "NZ", name: "New Zealand" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "ZA", name: "South Africa" },
  { code: "BR", name: "Brazil" },
  { code: "JP", name: "Japan" },
  { code: "MX", name: "Mexico" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"] | "GLOBAL";

export const DEFAULT_COUNTRY: CountryCode = "GB";

export function isCountryCode(value: string | undefined | null): value is CountryCode {
  if (!value) return false;
  if (value === "GLOBAL") return true;
  return COUNTRIES.some((c) => c.code === value);
}

export function resolveCountry(value: string | undefined | null): CountryCode {
  return isCountryCode(value) && value !== "GLOBAL" ? value : DEFAULT_COUNTRY;
}

export function countryLabel(code: CountryCode) {
  if (code === "GLOBAL") return "Worldwide";
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}
