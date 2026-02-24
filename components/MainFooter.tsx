export function MainFooter() {
  return (
    <footer className="border-t border-zinc-900 bg-black/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-[10px] uppercase tracking-[0.25em] text-zinc-600 md:flex-row md:items-center md:justify-between md:px-8">
        <p>© 2026 Koziol Luxury Gates. Wszelkie prawa zastrzeżone.</p>
        <div className="flex flex-wrap items-center gap-4 text-[9px]">
          <span className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-500">
            Producent ekskluzywnych bram i ogrodzeń
          </span>
          <span className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-500">
            Realizacje w całej Polsce
          </span>
        </div>
      </div>
    </footer>
  );
}

