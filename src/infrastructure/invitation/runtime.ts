import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IInvitationRepository } from "@/domain/repositories/IInvitationRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import { MockUserRepository } from "@/infrastructure/auth/MockUserRepository";
import { isMockAuthEnabled } from "@/infrastructure/auth/runtime";
import { MockFamilyRepository } from "@/infrastructure/family/MockFamilyRepository";
import { MockInvitationRepository } from "@/infrastructure/invitation/MockInvitationRepository";
import { SupabaseInvitationRepository } from "@/infrastructure/invitation/SupabaseInvitationRepository";
import { SupabaseFamilyRepository } from "@/infrastructure/supabase/SupabaseFamilyRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { SupabaseUserRepository } from "@/infrastructure/supabase/SupabaseUserRepository";

export async function createServerInvitationDependencies(): Promise<{
  familyRepository: IFamilyRepository;
  invitationRepository: IInvitationRepository;
  userRepository: IUserRepository;
}> {
  if (isMockAuthEnabled()) {
    return {
      familyRepository: new MockFamilyRepository(),
      invitationRepository: new MockInvitationRepository(),
      userRepository: new MockUserRepository(),
    };
  }

  const supabase = await createServerSupabaseClient();

  return {
    familyRepository: new SupabaseFamilyRepository(supabase),
    invitationRepository: new SupabaseInvitationRepository(supabase),
    userRepository: new SupabaseUserRepository(supabase),
  };
}
