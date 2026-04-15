import { createFamilyAction } from "@/app/actions/family";
import { CreateFamilyForm } from "@/presentation/components/family/CreateFamilyForm";

export default function NewFamilyPage() {
  return (
    <div className="mx-auto max-w-sm py-8">
      <CreateFamilyForm
        action={createFamilyAction}
        redirectTo="/calendar/settings"
      />
    </div>
  );
}
