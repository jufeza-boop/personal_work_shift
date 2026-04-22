import { Spinner } from "@/presentation/components/ui/Spinner";

export default function NewFamilyLoading() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-stone-200 bg-white/80 shadow-sm">
      <Spinner size="lg" />
    </section>
  );
}
