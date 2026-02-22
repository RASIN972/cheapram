"use client";

/**
 * Placeholder for display ads (e.g. AdSense).
 * Replace with your ad unit component once approved.
 */
export function AdSlot({ id = "ad-slot" }: { id?: string }) {
  return (
    <div
      id={id}
      className="flex min-h-[90px] w-full items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/30 py-6 text-zinc-500"
      role="presentation"
      aria-label="Advertisement"
    >
      <span className="text-xs">Ad placeholder</span>
    </div>
  );
}
