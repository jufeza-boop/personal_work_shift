export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-950 px-6 py-12 text-white">
      <section className="max-w-xl rounded-[2rem] border border-white/10 bg-white/8 p-8 backdrop-blur">
        <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-amber-300 uppercase">
          Modo sin conexión
        </p>
        <h1 className="mb-4 text-3xl font-semibold text-balance">
          La aplicación sigue disponible aunque ahora no tengas red.
        </h1>
        <p className="text-sm leading-7 text-white/75">
          Cuando vuelva la conexión, el service worker podrá recuperar contenido
          fresco y sincronizar las acciones pendientes.
        </p>
      </section>
    </main>
  );
}
