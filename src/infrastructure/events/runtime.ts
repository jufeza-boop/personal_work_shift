import type { IEventRepository } from "@/domain/repositories/IEventRepository";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import { isMockAuthEnabled } from "@/infrastructure/auth/runtime";
import { MockEventRepository } from "@/infrastructure/events/MockEventRepository";
import { MockFamilyRepository } from "@/infrastructure/family/MockFamilyRepository";
import { SupabaseEventRepository } from "@/infrastructure/supabase/SupabaseEventRepository";
import { SupabaseFamilyRepository } from "@/infrastructure/supabase/SupabaseFamilyRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export async function createServerEventDependencies(): Promise<{
  eventRepository: IEventRepository;
  familyRepository: IFamilyRepository;
}> {
  if (isMockAuthEnabled()) {
    return {
      eventRepository: new MockEventRepository(),
      familyRepository: new MockFamilyRepository(),
    };
  }

  const supabase = await createServerSupabaseClient();

  return {
    eventRepository: new SupabaseEventRepository(supabase),
    familyRepository: new SupabaseFamilyRepository(supabase),
  };
}
