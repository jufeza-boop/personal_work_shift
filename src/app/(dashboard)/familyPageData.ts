import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";
import { createServerFamilyDependencies } from "@/infrastructure/family/runtime";
import {
  ACTIVE_FAMILY_COOKIE,
  resolveActiveItem,
} from "@/shared/family/activeFamily";

export async function getFamilyPageData(redirectPath = "/calendar") {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectPath)}`);
  }

  const { familyRepository, userRepository } =
    await createServerFamilyDependencies();
  const families = await familyRepository.findByUserId(user.id);
  const cookieStore = await cookies();
  const activeFamily = resolveActiveItem(
    families,
    cookieStore.get(ACTIVE_FAMILY_COOKIE)?.value,
  );
  const memberEntries = activeFamily
    ? await Promise.all(
        activeFamily.members.map(async (member) => {
          const storedUser = await userRepository.findById(member.userId);

          return [
            member.userId,
            storedUser?.displayName ?? member.userId,
          ] as const;
        }),
      )
    : [];

  const delegatedUsers = await userRepository.findDelegatedUsers(user.id);

  return {
    activeFamily,
    delegatedUsers,
    families,
    memberDirectory: new Map(memberEntries),
    user,
  };
}
