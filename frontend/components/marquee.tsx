const items = [
  "Darija Datasets",
  "NLP Models",
  "Speech Recognition",
  "Text-to-Speech",
  "Translation",
  "Transliteration",
  // "Dialect Analysis",
];

function MarqueeContent() {
  return (
    <>
      {items.map((item) => (
        <div key={item} className="flex items-center px-6 shrink-0">
          <span
            className="text-xs font-medium tracking-wider uppercase"
            style={{ color: "white" }}
          >
            {item}
          </span>
          <span
            className="mx-6 text-xs"
            style={{ color: "rgba(255, 255, 255, 0.25)" }}
            aria-hidden="true"
          >
            ●
          </span>
        </div>
      ))}
    </>
  );
}

export function Marquee() {
  return (
    <div className="group relative border-y border-white/10 bg-black py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused]">
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </div>
  );
}
