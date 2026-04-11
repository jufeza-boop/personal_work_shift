import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import { MockUserRepository } from "@/infrastructure/auth/MockUserRepository";
import { isMockAuthEnabled } from "@/infrastructure/auth/runtime";
import { MockFamilyRepository } from "@/infrastructure/family/MockFamilyRepository";
import { SupabaseFamilyRepository } from "@/infrastructure/supabase/SupabaseFamilyRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { SupabaseUserRepository } from "@/infrastructure/supabase/SupabaseUserRepository";

export async function createServerFamilyDependencies(): Promise<{
  familyRepository: IFamilyRepository;
  userRepository: IUserRepository;
}> {
  if (isMockAuthEnabled()) {
    return {
      familyRepository: new MockFamilyRepository(),
      userRepository: new MockUserRepository(),
    };
  }

  const supabase = await createServerSupabaseClient();

  return {
    familyRepository: new SupabaseFamilyRepository(supabase),
    userRepository: new SupabaseUserRepository(supabase),
  };
}
