import Link from "next/link";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import {
  getMemberVideos,
  getVideoTitle,
  getVideoDescription,
  type VideoEntry,
} from "@/lib/videos";
import type { Locale } from "@os-community/shared";

function PrivateVideoCard({
  video,
  locale,
  labels,
}: {
  video: VideoEntry;
  locale: Locale;
  labels: {
    episode: string;
    keyLabel: string;
    watchExternal: string;
  };
}) {
  const title = getVideoTitle(video, locale);
  const description = getVideoDescription(video, locale);
  const watchUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;

  return (
    <div className="lf-card video-card">
      <div className="video-card-meta">
        <span className="badge badge-navy">
          {labels.episode}
          {video.order}
        </span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <YouTubeEmbed videoId={video.youtubeId} title={title} />
      <dl className="video-key-block" style={{ marginTop: "1rem" }}>
        <dt style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{labels.keyLabel}</dt>
        <dd>
          <code className="video-key-code">{video.youtubeId}</code>
        </dd>
      </dl>
      <p style={{ marginTop: "0.75rem" }}>
        <Link href={watchUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
          {labels.watchExternal}
        </Link>
      </p>
    </div>
  );
}

export function MyPagePrivateVideosSection({
  locale,
  labels,
}: {
  locale: Locale;
  labels: {
    title: string;
    desc: string;
    empty: string;
    episode: string;
    keyLabel: string;
    watchExternal: string;
  };
}) {
  const videos = getMemberVideos();
  if (videos.length === 0) {
    return (
      <section id="learning-videos" className="mypage-section">
        <h2 className="section-title">{labels.title}</h2>
        <p className="page-desc">{labels.desc}</p>
        <p className="page-muted-note">{labels.empty}</p>
      </section>
    );
  }

  return (
    <section id="learning-videos" className="mypage-section">
      <h2 className="section-title">{labels.title}</h2>
      <p className="page-desc">{labels.desc}</p>
      <div className="video-grid" style={{ marginTop: "1rem" }}>
        {videos.map((video) => (
          <PrivateVideoCard key={video.id} video={video} locale={locale} labels={labels} />
        ))}
      </div>
    </section>
  );
}
