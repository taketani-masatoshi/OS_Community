export type LabelMessages = {
  moduleType: { BUSINESS: string; JURISDICTION: string; WILD: string };
  moduleRole: { MAINTAINER: string; DEPUTY: string; CONTRIBUTOR: string };
  siteRole: {
    GUEST: string;
    MEMBER: string;
    CONTRIBUTOR: string;
    MAINTAINER: string;
    DEPUTY: string;
    ADMIN: string;
    CERT_REVIEWER: string;
  };
  certification: { STEWARD_OPERATOR: string; STEWARD_DESIGNER: string };
  communityRoles: { id: string; title: string; titleLocal: string; desc: string }[];
  promotionFlow: { from: string; to: string; criteria: string }[];
};
