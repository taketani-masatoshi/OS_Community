import Link from "next/link";

export function WelcomeBanner({
  userName,
  title,
  body,
  cta,
  href,
}: {
  userName: string;
  title: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="welcome-banner">
      <div className="welcome-banner-inner">
        <p className="welcome-banner-title">{title.replace("{name}", userName)}</p>
        <p className="welcome-banner-body">{body}</p>
        <Link href={href} className="btn btn-primary btn-sm">
          {cta}
        </Link>
      </div>
    </div>
  );
}
