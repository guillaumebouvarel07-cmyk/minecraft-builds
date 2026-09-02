"use client";

import { useEffect, useId, useRef, useState } from "react";

type MaterialOption = { minecraft_id: string; name: string };

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus-visible:border-accent";

export function MaterialAutocomplete({ initialSelected }: { initialSelected: MaterialOption[] }) {
  const [selected, setSelected] = useState<MaterialOption[]>(initialSelected);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MaterialOption[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim();
  // Dérivé pendant le rendu plutôt que via un setState dans l'effet
  // ci-dessous : évite un rendu en cascade quand la requête repasse sous 2
  // caractères (l'effet, lui, ne fait que le fetch débouncé).
  const visibleSuggestions = trimmedQuery.length >= 2 ? suggestions : [];

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/materials-search?q=${encodeURIComponent(trimmed)}`);
        const data: { materials?: MaterialOption[] } = await res.json();
        const selectedIds = new Set(selected.map((m) => m.minecraft_id));
        setSuggestions((data.materials ?? []).filter((m) => !selectedIds.has(m.minecraft_id)));
        setOpen(true);
        setHighlighted(-1);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `selected` ne doit pas redéclencher la requête
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectMaterial(material: MaterialOption) {
    setSelected((prev) => [...prev, material]);
    setQuery("");
    setSuggestions([]);
    setOpen(false);
  }

  function removeMaterial(minecraftId: string) {
    setSelected((prev) => prev.filter((m) => m.minecraft_id !== minecraftId));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || visibleSuggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((h) => Math.min(h + 1, visibleSuggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === "Enter") {
      if (highlighted >= 0) {
        event.preventDefault();
        selectMaterial(visibleSuggestions[highlighted]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-medium text-muted">
        Matériaux (tous requis si plusieurs)
      </label>
      <div ref={containerRef} className="relative mt-1.5">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open && visibleSuggestions.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={highlighted >= 0 ? `${listboxId}-option-${highlighted}` : undefined}
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => visibleSuggestions.length > 0 && setOpen(true)}
          placeholder="Rechercher un matériau (ex : oak planks)…"
          className={inputClass}
        />

        {open && visibleSuggestions.length > 0 && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Suggestions de matériaux"
            className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-line bg-surface-2 shadow-lg"
          >
            {visibleSuggestions.map((material, index) => (
              <li key={material.minecraft_id} id={`${listboxId}-option-${index}`} role="option" aria-selected={index === highlighted}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectMaterial(material)}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-surface ${
                    index === highlighted ? "bg-surface" : ""
                  }`}
                >
                  {material.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((material) => (
            <span
              key={material.minecraft_id}
              className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-dim px-2.5 py-0.5 text-xs font-medium text-accent"
            >
              {material.name}
              <input type="hidden" name="material" value={material.minecraft_id} />
              <button
                type="button"
                onClick={() => removeMaterial(material.minecraft_id)}
                aria-label={`Retirer ${material.name} des matériaux`}
                className="hover:text-fg"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
