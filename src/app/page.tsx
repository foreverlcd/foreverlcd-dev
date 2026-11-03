export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0B1220] text-slate-100">
      {/* Navegación */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="#" className="text-2xl font-bold tracking-tight">
          foreverlcd<span className="text-cyan-400">.</span>
        </a>

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-8 text-sm text-slate-300 md:flex"
        >
          <a href="#about" className="transition-colors hover:text-cyan-400">
            Sobre mí
          </a>
          <a href="#projects" className="transition-colors hover:text-cyan-400">
            Proyectos
          </a>
          <a href="#contact" className="transition-colors hover:text-cyan-400">
            Contacto
          </a>
        </nav>

        <a
          href="#contact"
          className="rounded-full border border-cyan-400/40 px-5 py-2.5 text-sm transition-colors hover:bg-cyan-400 hover:text-slate-950"
        >
          Hablemos ↗
        </a>
      </header>

      {/* Presentación principal */}
      <section className="mx-auto grid min-h-[calc(100svh-88px)] max-w-7xl items-center gap-12 px-6 pb-20 pt-12 lg:grid-cols-2 lg:px-10">
        <div className="relative z-10">
          <p className="mb-6 flex items-center gap-3 text-sm font-medium tracking-[0.2em] text-cyan-400 uppercase">
            <span className="h-px w-8 bg-cyan-400" />
            Desarrollador de software
          </p>

          <h1 className="max-w-2xl text-5xl leading-[1.1] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Construyo soluciones digitales
            <span className="text-cyan-400"> con propósito.</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-400">
            Desarrollo aplicaciones y experiencias digitales combinando
            tecnología, creatividad y buenas prácticas de ingeniería.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#projects"
              className="rounded-full bg-cyan-400 px-7 py-3.5 font-semibold text-slate-950 transition-transform hover:scale-105"
            >
              Explorar proyectos ↗
            </a>

            <a
              href="#contact"
              className="rounded-full border border-slate-700 px-7 py-3.5 font-medium transition-colors hover:border-cyan-400 hover:text-cyan-400"
            >
              Contactarme
            </a>
          </div>

          <p className="mt-16 text-sm tracking-wide text-slate-500">
            CUSCO, PERÚ · PORTFOLIO PROFESIONAL
          </p>
        </div>

        {/* Espacio provisional para la escena 3D */}
        <div
          aria-hidden="true"
          className="relative mx-auto flex aspect-square w-full max-w-lg items-center justify-center"
        >
          <div className="absolute inset-8 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex aspect-square w-4/5 items-center justify-center rounded-full border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-blue-500/5 to-transparent">
            <div className="absolute inset-8 rounded-full border border-cyan-300/20" />

            <div className="absolute inset-16 rounded-full border border-dashed border-cyan-300/30" />

            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-cyan-200 via-cyan-500 to-blue-700 shadow-[0_0_80px_rgba(34,211,238,0.35)]" />
          </div>

          <span className="absolute right-0 bottom-16 rounded-full border border-cyan-400/20 bg-slate-900/80 px-4 py-2 text-xs tracking-widest text-cyan-300">
            CREATIVE ENGINEERING
          </span>
        </div>
      </section>
    </main>
  );
}
