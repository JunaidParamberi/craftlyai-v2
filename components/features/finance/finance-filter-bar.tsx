"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, Search, X } from "lucide-react";
import type { DateRange as DayPickerRange } from "react-day-picker";

import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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

const STATUS_PILLS = [
  { label: "All", value: "" },
  { label: "Paid", value: "paid" },
  { label: "Outstanding", value: "outstanding" },
  { label: "Overdue", value: "overdue" },
  { label: "Draft", value: "draft" },
] as const;

export function FinanceFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const statusParam = searchParams.get("status") ?? "";
  const searchParam = searchParams.get("search") ?? "";

  const [activePreset, setActivePreset] = useState<PresetLabel | null>(
    !fromParam && !toParam ? "This Month" : null
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [customRange, setCustomRange] = useState<DayPickerRange | undefined>();
  const [searchValue, setSearchValue] = useState(searchParam);

  useEffect(() => {
    setSearchValue(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`/finance?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  function applyRange(from: Date, to: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", formatDateParam(from));
    params.set("to", formatDateParam(to));
    params.delete("page");
    router.push(`/finance?${params.toString()}`);
  }

  function handlePreset(preset: (typeof PRESETS)[number]) {
    setActivePreset(preset.label);
    setCustomRange(undefined);
    const { from, to } = preset.getRange();
    applyRange(from, to);
  }

  function handleStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.delete("page");
    router.push(`/finance?${params.toString()}`);
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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
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

        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger
            className={cn(
              buttonVariants({
                variant: activePreset === null ? "default" : "outline",
                size: "sm",
              }),
              "h-8 gap-1.5 rounded-full text-xs"
            )}
          >
            <CalendarIcon className="size-3" />
            {customLabel}
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
              <Button variant="outline" size="sm" onClick={() => setCalendarOpen(false)}>
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {STATUS_PILLS.map((pill) => (
            <button
              key={pill.label}
              onClick={() => handleStatus(pill.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                statusParam === pill.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search invoices…"
            className="h-8 w-56 rounded-full pl-8 pr-8 text-xs"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
