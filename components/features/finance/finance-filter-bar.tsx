"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange as DayPickerRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  currentMonthRange,
  formatDateParam,
  lastNMonthsRange,
  yearToDateRange,
} from "@/lib/finance/date-utils";

const PRESETS = [
  { label: "This Month", getRange: currentMonthRange },
  { label: "Last 3M", getRange: () => lastNMonthsRange(3) },
  { label: "This Year", getRange: yearToDateRange },
] as const;

type PresetLabel = (typeof PRESETS)[number]["label"];

export function FinanceFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const [activePreset, setActivePreset] = useState<PresetLabel | null>(
    !fromParam && !toParam ? "This Month" : null
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [customRange, setCustomRange] = useState<DayPickerRange | undefined>();

  function applyRange(from: Date, to: Date) {
    const params = new URLSearchParams();
    params.set("from", formatDateParam(from));
    params.set("to", formatDateParam(to));
    router.push(`/finance?${params.toString()}`);
  }

  function handlePreset(preset: (typeof PRESETS)[number]) {
    setActivePreset(preset.label);
    setCustomRange(undefined);
    const { from, to } = preset.getRange();
    applyRange(from, to);
  }

  function handleCustomApply() {
    if (!customRange?.from || !customRange?.to) return;
    setActivePreset(null);
    applyRange(customRange.from, customRange.to);
    setCalendarOpen(false);
  }

  const customLabel =
    customRange?.from && customRange?.to
      ? `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d, yyyy")}`
      : activePreset === null && fromParam && toParam
        ? `${format(new Date(fromParam), "MMM d")} – ${format(new Date(toParam), "MMM d, yyyy")}`
        : "Custom";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Segmented preset pills */}
      <div className="flex items-center rounded-full border border-border bg-muted/40 p-0.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
              activePreset === preset.label
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger>
          <Button
            variant={activePreset === null ? "default" : "outline"}
            size="sm"
            className="h-8 gap-1.5 rounded-full text-xs"
          >
            <CalendarIcon className="size-3" />
            {customLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={customRange}
            onSelect={setCustomRange}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!customRange?.from || !customRange?.to}
              onClick={handleCustomApply}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
