"use client";

import { cn } from "../../lib/cn";

export type TabDefinition = {
  key: "call" | "chat" | "lobby";
  label: string;
  content: React.ReactNode;
};

export function TabPanel({
  tabs,
  activeKey,
  onChange
}: {
  tabs: TabDefinition[];
  activeKey: TabDefinition["key"];
  onChange: (key: TabDefinition["key"]) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-2 border-b border-white/10 px-4 py-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition",
              tab.key === activeKey
                ? "bg-white text-slate-950"
                : "bg-white/6 text-[var(--muted)] hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {tabs.find((tab) => tab.key === activeKey)?.content}
      </div>
    </div>
  );
}
