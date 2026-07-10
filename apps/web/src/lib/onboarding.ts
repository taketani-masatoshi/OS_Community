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

export function buildOnboardingSteps(input: {
  mp: Messages["mypage"];
  profileComplete: boolean;
  hasParticipation: boolean;
}): OnboardingStepView[] {
  const { mp, profileComplete, hasParticipation } = input;

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
      id: "browse",
      title: mp.onboardingStepBrowse,
      body: mp.onboardingStepBrowseBody,
      href: "/modules#registry",
      cta: mp.browseModules.replace(" →", ""),
      done: hasParticipation,
    },
    {
      id: "participate",
      title: mp.onboardingStepParticipate,
      body: mp.onboardingStepParticipateBody,
      href: "/modules#registry",
      cta: mp.actionModules,
      done: hasParticipation,
    },
  ];
}
