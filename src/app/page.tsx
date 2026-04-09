import { CheckCircle2, ShieldCheck, Smartphone, Waves } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";

const bootstrapHighlights = [
  {
    icon: CheckCircle2,
    title: "Base técnica preparada",
    description:
      "Next.js 16, TypeScript estricto, ESLint, Prettier y Vitest listos para trabajar.",
  },
  {
    icon: Waves,
    title: "Diseño sistematizado",
    description:
      "Tailwind CSS v4 y Shadcn/ui quedan alineados con la arquitectura limpia del proyecto.",
  },
  {
    icon: Smartphone,
    title: "PWA desde el inicio",
    description:
      "Serwist deja preparado el service worker, la offline shell y el manifiesto de instalación.",
  },
  {
    icon: ShieldCheck,
    title: "Trabajo local consistente",
    description:
      "Supabase CLI, variables de entorno y pipeline de GitHub definidos para arrancar sin deriva.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(238,201,151,0.45),_transparent_36%),linear-gradient(180deg,#fbf6ef_0%,#f2e8d6_100%)] px-6 py-10 text-slate-900 sm:px-10 lg:px-16">
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,30rem)]">
        <Card className="overflow-hidden border-stone-200/70 bg-white/80 shadow-[0_24px_80px_rgba(120,89,52,0.14)] backdrop-blur">
          <CardHeader className="gap-6 border-b border-stone-200/70 pb-8">
            <div className="inline-flex w-fit items-center rounded-full border border-amber-300/60 bg-amber-100/80 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-amber-900 uppercase">
              Phase 0 completada
            </div>
            <div className="space-y-4">
              <CardTitle className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Organiza los turnos de toda tu familia en un solo lugar.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Base de proyecto lista: Next.js, Tailwind, Shadcn/ui, pruebas y
                PWA.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#estado-bootstrap">Ver estado del arranque</a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="/manifest.webmanifest">Abrir manifiesto PWA</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent
            className="grid gap-4 py-8 sm:grid-cols-2"
            id="estado-bootstrap"
          >
            {bootstrapHighlights.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-stone-200/80 bg-stone-50/90 p-5 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Icon className="mb-4 h-6 w-6 text-amber-700" />
                <h2 className="mb-2 text-lg font-semibold text-slate-900">
                  {title}
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="border-stone-200/70 bg-slate-950 text-white shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
            <CardHeader>
              <CardTitle className="text-2xl">Qué queda preparado</CardTitle>
              <CardDescription className="text-slate-300">
                La siguiente iteración ya puede centrarse en dominio y casos de
                uso, no en tooling.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              <p>
                Arquitectura limpia creada en disco para dominio, aplicación,
                infraestructura, presentación y compartidos.
              </p>
              <p>
                Supabase local inicializado con rutas de seeds y scripts de
                arranque desde npm.
              </p>
              <p>
                Service worker y offline shell listos para evolucionar cuando
                entren los flujos reales.
              </p>
            </CardContent>
          </Card>
          <Card className="border-stone-200/70 bg-white/75">
            <CardHeader>
              <CardTitle className="text-xl">Siguiente foco</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-slate-600">
              <p>
                Fase 1 puede arrancar definiendo entidades, value objects e
                interfaces con TDD.
              </p>
              <p>
                La canalización de CI ya validará formato, lint, tests y build
                cuando el código del dominio empiece a crecer.
              </p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
