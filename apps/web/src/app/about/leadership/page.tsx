import Link from "next/link";
import {
  LEADERSHIP_CATEGORY_ORDER,
  LEADERSHIP_MEMBERS,
  FOUNDER_NAME,
  FOUNDER_PROFILE_SLUG,
  getLocalized,
  getPageMessages,
} from "@os-community/shared";
import { LeadershipDirectory, type LeadershipCardData } from "@/components/LeadershipDirectory";
import { getLocale, getT } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export default async function LeadershipPage() {
  const locale = await getLocale();
  const { messages: t } = await getT();
  const lp = getPageMessages(locale).leadership;

  const profileSlugs = LEADERSHIP_MEMBERS.map((m) => m.profileSlug).filter(Boolean) as string[];

  const dbUsers = await prisma.user
    .findMany({
      where: {
        OR: [
          { publicSlug: { in: profileSlugs } },
          { name: FOUNDER_NAME },
        ],
      },
      select: {
        publicSlug: true,
        name: true,
        image: true,
        professionalProfile: { select: { profileUrl: true } },
      },
    })
    .catch(
      (): {
        publicSlug: string | null;
        name: string | null;
        image: string | null;
        professionalProfile: { profileUrl: string | null } | null;
      }[] => [],
    );

  const userBySlug = new Map(
    dbUsers.flatMap((user) => {
      const keys = [user.publicSlug, user.name === FOUNDER_NAME ? FOUNDER_PROFILE_SLUG : null].filter(
        Boolean
      ) as string[];
      return keys.map((key) => [key, user] as const);
    })
  );

  const members: LeadershipCardData[] = LEADERSHIP_MEMBERS.map((member) => {
    const dbUser = member.profileSlug ? userBySlug.get(member.profileSlug) : undefined;
    const linkedinUrl =
      member.linkedinUrl ?? dbUser?.professionalProfile?.profileUrl ?? undefined;

    return {
      id: member.id,
      category: member.category,
      categoryLabel: lp.categories[member.category],
      name: member.name,
      role: getLocalized(member.role, locale),
      organization: getLocalized(member.organization, locale),
      bio: getLocalized(member.bio, locale),
      profileHref: member.profileSlug ? `/users/${member.profileSlug}` : undefined,
      linkedinUrl,
      imageUrl: dbUser?.image ?? null,
    };
  });

  const categories = [
    { id: "all" as const, label: lp.filterAll },
    ...LEADERSHIP_CATEGORY_ORDER.map((id) => ({
      id,
      label: lp.categories[id],
    })),
  ];

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <Link href="/about" className="hero-back-link">
            {lp.back}
          </Link>
          <h1 className="lf-hero-title-sm">{lp.title}</h1>
          <p className="lf-hero-lead">{lp.lead}</p>
        </div>
      </section>

      <div className="page-wrap leadership-page">
        <LeadershipDirectory
          members={members}
          categories={categories}
          filterLabel={lp.filterLabel}
          emptyCategory={lp.emptyCategory}
          viewProfile={lp.viewProfile}
          viewLinkedIn={lp.viewLinkedIn}
        />

        <div className="leadership-page-links">
          <Link href="/governance" className="btn btn-primary btn-sm">
            {t.nav.governance}
          </Link>
          <Link href="/committees" className="btn btn-primary btn-sm">
            {t.nav.committees}
          </Link>
        </div>
      </div>
    </>
  );
}
