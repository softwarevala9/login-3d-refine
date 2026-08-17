import { useMemo, useState } from "react";
import { Check, Languages, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LANGUAGES, findLanguage } from "@/lib/languages";
import { cn } from "@/lib/utils";

export function LanguageSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = findLanguage(value);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Select language"
          className="inline-flex max-w-[190px] items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] text-white/80 shadow-[inset_0_1px_0_oklch(1_0_0/0.12)] ring-1 ring-white/10 backdrop-blur-md transition-all hover:bg-white/[0.12] hover:ring-white/20"
        >
          <Languages className="size-3 shrink-0" />
          <span className="text-[11px] leading-none">{current.flag}</span>
          <span className="truncate">{current.native}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[290px] overflow-hidden border-white/10 bg-[oklch(0.16_0.02_265/0.92)] p-0 text-white shadow-[0_24px_60px_-20px_oklch(0_0_0/0.8)] backdrop-blur-2xl"
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <Search className="size-3.5 shrink-0 text-white/40" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${LANGUAGES.length} languages…`}
            className="w-full bg-transparent text-xs text-white placeholder:text-white/35 outline-none"
          />
        </div>
        <div className="max-h-[290px] overflow-y-auto py-1">
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-white/40">No language found.</p>
          )}
          {results.map((l) => {
            const active = l.code === current.code;
            return (
              <button
                key={l.code}
                type="button"
                dir={l.rtl ? "rtl" : "ltr"}
                onClick={() => {
                  onChange(l.code);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-xs transition-colors",
                  active ? "bg-white/[0.12] text-white" : "text-white/75 hover:bg-white/[0.07]",
                )}
              >
                <span className="text-sm leading-none">{l.flag}</span>
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-medium">{l.native}</span>
                  {l.native.toLowerCase() !== l.name.toLowerCase() && (
                    <span className="ml-1.5 text-white/40">{l.name}</span>
                  )}
                </span>
                <span className="shrink-0 text-[9px] uppercase tracking-wider text-white/30">
                  {l.code}
                </span>
                {active && <Check className="size-3 shrink-0 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
