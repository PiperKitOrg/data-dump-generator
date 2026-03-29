import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/20 dark:bg-zinc-900">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
