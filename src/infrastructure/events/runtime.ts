import type { IEventRepository } from "@/domain/repositories/IEventRepository";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import { isMockAuthEnabled } from "@/infrastructure/auth/runtime";
import { MockUserRepository } from "@/infrastructure/auth/MockUserRepository";
import { MockEventRepository } from "@/infrastructure/events/MockEventRepository";
import { MockFamilyRepository } from "@/infrastructure/family/MockFamilyRepository";
import { SupabaseEventRepository } from "@/infrastructure/supabase/SupabaseEventRepository";
import { SupabaseFamilyRepository } from "@/infrastructure/supabase/SupabaseFamilyRepository";
import { SupabaseUserRepository } from "@/infrastructure/supabase/SupabaseUserRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export async function createServerEventDependencies(): Promise<{
  eventRepository: IEventRepository;
  familyRepository: IFamilyRepository;
  userRepository: IUserRepository;
}> {
  if (isMockAuthEnabled()) {
    return {
      eventRepository: new MockEventRepository(),
      familyRepository: new MockFamilyRepository(),
      userRepository: new MockUserRepository(),
    };
  }

  const supabase = await createServerSupabaseClient();

  return {
    eventRepository: new SupabaseEventRepository(supabase),
    familyRepository: new SupabaseFamilyRepository(supabase),
    userRepository: new SupabaseUserRepository(supabase),
  };
}
