export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 pt-32 pb-24 md:pt-48 md:pb-40 text-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full blur-3xl"></div>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-black/60 shadow-sm backdrop-blur-xl">
          <span className="flex h-2 w-2 rounded-full bg-black mr-3"></span>
          Building the Future of Algerian AI
        </div>

        {/* Main heading */}
        <div>
          <h1 className="text-6xl font-black tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl leading-none mb-6">
            awras
          </h1>
          <p className="text-xl md:text-2xl text-black/70 font-light leading-relaxed max-w-2xl mx-auto">
            Toward an ecosystem dedicated to preserving and empowering the
            Algerian dialect (Darija) through advanced Artificial Intelligence.
          </p>
        </div>
      </div>
    </section>
  );
}
