import Link from "next/link";
import { CalendarDays, Users, Repeat2, ArrowRight } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";

const features = [
  {
    icon: CalendarDays,
    title: "Calendario mensual",
    description:
      "Visualiza los turnos de toda la familia en una cuadrícula clara, navegando mes a mes.",
  },
  {
    icon: Users,
    title: "Gestión familiar",
    description:
      "Crea tu familia, invita a los miembros y asigna una paleta de color a cada persona.",
  },
  {
    icon: Repeat2,
    title: "Eventos recurrentes",
    description:
      "Registra turnos de trabajo, estudios u otros eventos que se repiten a lo largo del tiempo.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(238,201,151,0.45),_transparent_36%),linear-gradient(180deg,#fbf6ef_0%,#f2e8d6_100%)] text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6 sm:px-10">
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <CalendarDays className="h-5 w-5" />
            <span>Personal Work Shift</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center sm:px-10">
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Organiza los turnos de toda tu familia en un solo lugar
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Calendario compartido, eventos recurrentes y paletas de color por
          miembro — todo sincronizado entre dispositivos.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/register">
              Empezar gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/login">Ya tengo cuenta</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-20 sm:px-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              className="border-stone-200/70 bg-white/80 shadow-sm"
              key={title}
            >
              <CardHeader className="pb-3">
                <Icon className="mb-2 h-6 w-6 text-amber-700" />
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-6">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
