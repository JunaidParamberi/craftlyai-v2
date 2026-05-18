"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRegions } from "@/lib/data/regions";

type Props = {
  id?: string;
  countryCode: string | null | undefined;
  value: string;
  onChange: (value: string) => void;
  "aria-invalid"?: boolean;
};

/**
 * Country-aware region picker. Renders a Select with curated subdivisions
 * for target markets (UAE, KSA, Qatar, Kuwait, Bahrain, Oman, Egypt, UK, US, India);
 * falls back to a free-text Input for every other country.
 */
export function RegionSelect({ id, countryCode, value, onChange, ...rest }: Props) {
  const options = getRegions(countryCode);

  if (!options) {
    return (
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="address-level1"
        aria-invalid={rest["aria-invalid"]}
      />
    );
  }

  return (
    <Select value={value || undefined} onValueChange={(v) => onChange(v ?? "")}>
      <SelectTrigger id={id} aria-invalid={rest["aria-invalid"]} className="w-full">
        <SelectValue placeholder="Select…" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.code} value={option.name}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
