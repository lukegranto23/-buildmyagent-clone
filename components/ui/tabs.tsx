"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { clsx } from "clsx";

type TabsContextValue = {
  activeValue: string;
  setActiveValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

type TabsProps = {
  defaultValue: string;
  children: ReactNode;
  className?: string;
};

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [activeValue, setActiveValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within <Tabs>");
  }
  return context;
}

type TabsListProps = {
  children: ReactNode;
  className?: string;
};

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-gray-100 p-1 text-xs font-semibold text-gray-600",
        "shadow-inner",
        className
      )}
    >
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2">{children}</div>
    </div>
  );
}

type TabsTriggerProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { activeValue, setActiveValue } = useTabs();
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      onClick={() => setActiveValue(value)}
      className={clsx(
        "w-full rounded-xl px-3 py-2 transition",
        isActive ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-900",
        className
      )}
    >
      {children}
    </button>
  );
}

type TabsContentProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeValue } = useTabs();
  if (activeValue !== value) return null;

  return <div className={className}>{children}</div>;
}

