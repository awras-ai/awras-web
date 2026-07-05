"use client";

interface EntryFormFieldsProps {
  word: string;
  onWordChange: (value: string) => void;
  wordArabizi: string;
  onWordArabiziChange: (value: string) => void;
  meaning: string;
  onMeaningChange: (value: string) => void;
  examples: string;
  onExamplesChange: (value: string) => void;
}

export function EntryFormFields({
  word,
  onWordChange,
  wordArabizi,
  onWordArabiziChange,
  meaning,
  onMeaningChange,
  examples,
  onExamplesChange,
}: EntryFormFieldsProps) {
  return (
    <>
      {/* Word */}
      <div>
        <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-2">
          Word
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={wordArabizi}
            onChange={(e) => onWordArabiziChange(e.target.value)}
            placeholder="Arabizi…"
            className="flex-1 rounded-md border border-black/10 bg-transparent px-3 py-2.5 text-base text-black/60 leading-relaxed outline-none transition-colors placeholder:text-black/25 focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20"
          />
          <input
            type="text"
            value={word}
            onChange={(e) => onWordChange(e.target.value)}
            dir="rtl"
            placeholder="الكلمة…"
            className="flex-[2] rounded-md border border-black/10 bg-transparent px-3 py-2.5 text-lg text-black/80 leading-relaxed text-right outline-none transition-colors placeholder:text-black/25 focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20"
          />
        </div>
      </div>

      {/* Meaning */}
      <div>
        <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-2">
          Meaning
        </p>
        <textarea
          value={meaning}
          onChange={(e) => onMeaningChange(e.target.value)}
          dir="rtl"
          rows={3}
          className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2.5 text-base text-black/80 leading-relaxed text-right resize-none outline-none transition-colors focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20"
        />
      </div>

      {/* Examples */}
      <div>
        <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-2">
          Examples
        </p>
        <textarea
          value={examples}
          onChange={(e) => onExamplesChange(e.target.value)}
          dir="rtl"
          rows={2}
          placeholder="No examples yet…"
          className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2.5 text-base text-black/70 leading-relaxed text-right resize-none outline-none transition-colors placeholder:text-black/25 focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20"
        />
      </div>
    </>
  );
}
