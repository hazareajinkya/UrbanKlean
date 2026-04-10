"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ICronPreset {
  label: string;
  expression: string;
}

const CRON_PRESETS: ICronPreset[] = [
  { label: "every minute", expression: "* * * * *" },
  { label: "every 10 minutes", expression: "*/10 * * * *" },
  { label: "every hour", expression: "0 * * * *" },
  { label: "every day at midnight", expression: "0 0 * * *" },
  { label: "every day at 12pm", expression: "0 12 * * *" },
  { label: "every week", expression: "0 0 * * 0" },
  { label: "first day of every month", expression: "0 0 1 * *" },
];

interface CronInputProps {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  timezone?: string;
  timezones?: string[];
  onTimezoneChange?: (timezone: string) => void;
  onDelete?: () => void;
  showDelete?: boolean;
  showTimezone?: boolean;
}

export const CronInput = ({
  id,
  value = "0 0 * * *",
  onChange,
  timezone = "UTC",
  timezones = [],
  onTimezoneChange,
  onDelete,
  showDelete = false,
  showTimezone = false,
}: CronInputProps) => {
  const [customInput, setCustomInput] = useState(value);
  const [open, setOpen] = useState(false);
  const timezoneOptions = useMemo(
    () => (timezones.length > 0 ? timezones : ["UTC"]),
    [timezones],
  );

  useEffect(() => {
    setCustomInput(value);
  }, [value]);

  const handlePresetSelect = (expression: string) => {
    setCustomInput(expression);
    onChange?.(expression);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3 ">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative flex-1">
              <Input
                id={id}
                type="text"
                value={customInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setCustomInput(nextValue);
                  onChange?.(nextValue);
                }}
                placeholder="0 0 * * *"
                className="pr-10 font-mono text-sm"
              />
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <div className="flex flex-col">
              {CRON_PRESETS.map((preset) => (
                <button
                  key={preset.expression}
                  type="button"
                  onClick={() => handlePresetSelect(preset.expression)}
                  className={`border-b border-border px-3 py-2.5 text-left text-sm transition-colors last:border-b-0 ${
                    customInput === preset.expression
                      ? "bg-primary/10 text-foreground font-medium"
                      : "text-foreground/80 hover:bg-muted"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {showDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-muted-foreground hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showTimezone && (
        <Select value={timezone} onValueChange={onTimezoneChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Timezone" />
          </SelectTrigger>
          <SelectContent>
            {timezoneOptions.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz === "UTC" ? `${tz} (by default)` : tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
