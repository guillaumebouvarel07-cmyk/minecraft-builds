export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface ${
        hover ? "transition-colors hover:border-accent/40" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
