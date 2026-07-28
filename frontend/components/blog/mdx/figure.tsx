import Image from "next/image";

export function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="mt-10">
      <div className="h-64 md:h-96 rounded-2xl overflow-hidden relative bg-neutral-100">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3.5 text-center text-sm text-neutral-400">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
