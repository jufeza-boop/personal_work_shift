import Link from "next/link";
import { redirect } from "next/navigation";
import { acceptInvitationAction } from "@/app/actions/invitation";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";
import { createServerInvitationDependencies } from "@/infrastructure/invitation/runtime";
import { AcceptInvitationForm } from "@/app/invite/[token]/AcceptInvitationForm";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";
import type { PaletteOption } from "@/presentation/components/family/ColorPalettePicker";
import { Button } from "@/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  const user = await getAuthenticatedUser();

  if (!user) {
    const redirectTo = encodeURIComponent(`/invite/${token}`);

    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(238,201,151,0.45),_transparent_36%),linear-gradient(180deg,#fbf6ef_0%,#f2e8d6_100%)] px-6 py-10">
        <Card className="w-full max-w-md border-stone-200 bg-white/90 shadow-xl">
          <CardHeader className="space-y-2">
            <CardTitle>Inicia sesión o regístrate</CardTitle>
            <CardDescription className="text-slate-600">
              Para unirte a esta familia primero necesitas iniciar sesión o
              crear una cuenta. Después, vuelve a usar este mismo enlace de
              invitación.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/login?redirectTo=${redirectTo}`}>
                Iniciar sesión
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/register?redirectTo=${redirectTo}`}>
                Registrarte
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { invitationRepository, familyRepository } =
    await createServerInvitationDependencies();

  const invitation = await invitationRepository.findByToken(token);

  if (!invitation) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Invitación no encontrada
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Este enlace de invitación no existe o ha sido eliminado.
          </p>
          <Link
            className="mt-6 inline-block text-sm font-medium text-slate-700 underline"
            href="/"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const now = new Date();
  const displayStatus = invitation.computeCurrentStatus(now);

  if (displayStatus !== "active") {
    const messages: Record<string, string> = {
      cancelled:
        "Esta invitación fue cancelada por el propietario de la familia.",
      expired:
        "Esta invitación ha caducado. Pide al propietario que genere un nuevo enlace.",
      used: "Esta invitación ya fue utilizada.",
    };

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Invitación no válida
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {messages[displayStatus] ??
              "Esta invitación ya no está disponible."}
          </p>
          <Link
            className="mt-6 inline-block text-sm font-medium text-slate-700 underline"
            href="/"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  // Check if the user is already a member
  const family = await familyRepository.findById(invitation.familyId);

  if (family && family.hasMember(user.id)) {
    redirect("/calendar");
  }

  // Build palette options (no members yet filtered — family may have members)
  const paletteOptions: PaletteOption[] = ColorPalette.availablePalettes().map(
    (paletteName) => {
      const takenByMember = family
        ? family.members.some(
            (m) =>
              m.colorPalette !== null && m.colorPalette.name === paletteName,
          )
        : false;

      return { disabled: takenByMember, name: paletteName };
    },
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">
          Invitación a familia
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Válida hasta{" "}
          {invitation.expiresAt.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <AcceptInvitationForm
          action={acceptInvitationAction}
          familyName={invitation.familyName}
          paletteOptions={paletteOptions}
          token={token}
        />
      </div>
    </main>
  );
}
