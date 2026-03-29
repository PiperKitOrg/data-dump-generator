"use client";

import * as Tooltip from "@radix-ui/react-tooltip";

type InfoTooltipProps = {
  content: string;
};

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={180}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-black/25 text-[10px] leading-none opacity-80 hover:opacity-100 dark:border-white/30"
            aria-label="More info"
          >
            ?
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={8}
            className="max-w-64 rounded-md border border-black/15 bg-white px-2 py-1.5 text-xs text-black shadow-sm dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {content}
            <Tooltip.Arrow className="fill-white dark:fill-zinc-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
