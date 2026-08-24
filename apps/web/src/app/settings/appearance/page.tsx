import { AppearancePicker } from "@/components/AppearancePicker";
import { getT } from "@/lib/i18n";

export default async function SettingsAppearancePage() {
  const { messages: t } = await getT();
  const s = t.settings;

  return (
    <>
      <h2 className="section-title" style={{ marginTop: 0 }}>
        {s.appearance}
      </h2>
      <p className="page-desc">{s.appearanceDesc}</p>

      <div className="lf-card" style={{ marginTop: "1.5rem" }}>
        <AppearancePicker
          labels={{
            legend: s.appearanceLegend,
            light: s.themeLight,
            lightHint: s.themeLightHint,
            dark: s.themeDark,
            darkHint: s.themeDarkHint,
            system: s.themeSystem,
            systemHint: s.themeSystemHint,
          }}
        />
        <p className="page-muted-note" style={{ marginTop: "1.25rem", marginBottom: 0 }}>
          {s.appearanceNote}
        </p>
      </div>
    </>
  );
}
