import { Sun } from "../ornaments/Ornaments";

export function FullPageLoader({ label = "Opening your planner" }: { label?: string }) {
  return (
    <div className="full-loader" role="status" aria-live="polite">
      <Sun size={72} className="full-loader__sun" />
      <p className="script full-loader__label">{label}</p>
    </div>
  );
}