import { PushSettings } from "@/components/settings/push-settings";
import { ThemeSettings } from "@/components/settings/theme-settings";

const leagues = ["英超", "欧冠", "西甲"];
const teams = ["阿森纳", "皇马", "巴萨"];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <ThemeSettings />
      <PushSettings />

      <section className="match-surface rounded-lg border bg-card p-4">
        <h2 className="text-lg font-semibold text-text">关注联赛</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {leagues.map((league) => (
            <span
              className="interactive-control rounded-full border bg-background px-3 py-2 text-sm font-medium text-text"
              key={league}
            >
              {league}
            </span>
          ))}
        </div>
      </section>

      <section className="match-surface rounded-lg border bg-card p-4">
        <h2 className="text-lg font-semibold text-text">关注球队</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {teams.map((team) => (
            <span
              className="interactive-control rounded-full border bg-background px-3 py-2 text-sm font-medium text-text"
              key={team}
            >
              {team}
            </span>
          ))}
        </div>
      </section>

      <section className="match-surface rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text">简报时间</h2>
            <p className="mt-1 text-sm text-muted">每天早上推送</p>
          </div>
          <span className="score-chip rounded-lg border bg-background px-4 py-3 font-mono text-lg font-semibold text-text">
            09:00
          </span>
        </div>
      </section>
    </div>
  );
}
