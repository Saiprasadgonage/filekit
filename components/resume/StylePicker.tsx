"use client";

import { TEMPLATES, TemplateId } from "./types";

export default function StylePicker({
  selected,
  onSelect
}: {
  selected: TemplateId;
  onSelect: (id: TemplateId) => void;
}) {
  return (
    <div>
      <p className="text-paper font-medium mb-4">Pick a style.</p>
      <div className="grid grid-cols-1 gap-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`text-left border rounded-md p-4 transition-colors ${
              selected === t.id ? "border-amber bg-panel2" : "border-line bg-panel2 hover:border-dim"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-paper font-medium">{t.name}</span>
              {selected === t.id && <span className="text-amber text-sm">Selected</span>}
            </div>
            <p className="text-dim text-sm mt-1">{t.blurb}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
