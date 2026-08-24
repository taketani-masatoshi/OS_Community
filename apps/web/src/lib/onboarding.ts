import type { Messages } from "@os-community/shared";
import type { OnboardingStepView } from "@/components/mypage/MyPageOnboardingChecklist";
import type { UserCommunities } from "@/lib/user-communities";

export function isNewParticipant(input: {
  communities: UserCommunities;
  wildModuleCount: number;
  pendingOrApprovedRequests: number;
}): boolean {
  const { communities, wildModuleCount, pendingOrApprovedRequests } = input;
  return (
    communities.modules.length === 0 &&
    !communities.standard &&
    communities.domain.length === 0 &&
    wildModuleCount === 0 &&
    pendingOrApprovedRequests === 0
  );
}

/** Setup incomplete until Google/profile identity and org claim are done. */
export function needsSetupChecklist(input: {
  profileComplete: boolean;
  hasOrgAffiliation: boolean;
  hasOooCert: boolean;
}): boolean {
  return !input.profileComplete || !input.hasOrgAffiliation || !input.hasOooCert;
}

/**
 * Initial path: Google/OpenOrg ID + profile → corporate-number org claim → OOO → participation.
 */
export function buildOnboardingSteps(input: {
  mp: Messages["mypage"];
  profileComplete: boolean;
  hasOrgAffiliation: boolean;
  hasOooCert: boolean;
  hasParticipation: boolean;
}): OnboardingStepView[] {
  const { mp, profileComplete, hasOrgAffiliation, hasOooCert, hasParticipation } = input;

  return [
    {
      id: "profile",
      title: mp.onboardingStepProfile,
      body: mp.onboardingStepProfileBody,
      href: "/settings/profile",
      cta: mp.editProfile,
      done: profileComplete,
    },
    {
      id: "org",
      title: mp.onboardingStepOrg,
      body: mp.onboardingStepOrgBody,
      href: "/settings/organization",
      cta: mp.opsClaimOrg,
      done: hasOrgAffiliation,
    },
    {
      id: "ooo",
      title: mp.onboardingStepOoo,
      body: mp.onboardingStepOooBody,
      href: "/certifications/apply",
      cta: mp.opsApplyOoo,
      done: hasOooCert,
    },
    {
      id: "participate",
      title: mp.onboardingStepParticipate,
      body: mp.onboardingStepParticipateBody,
      href: "/committees",
      cta: mp.actionCommittees,
      done: hasParticipation,
    },
  ];
}
