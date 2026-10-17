export function FullPageLoader({ label = "Opening your planner" }: { label?: string }) {
  return (
    <div className="full-loader" role="status" aria-live="polite">
      <p>{label}</p>
    </div>
  );
}