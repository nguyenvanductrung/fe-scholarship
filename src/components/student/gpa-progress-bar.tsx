import { cn } from "@/lib/utils";

export function GpaProgressBar({
  currentGpa,
  requiredGpa,
  className,
}: {
  currentGpa: number;
  requiredGpa: number;
  className?: string;
}) {
  const pct = requiredGpa > 0 ? Math.min(100, (currentGpa / requiredGpa) * 100) : 0;
  const met = currentGpa >= requiredGpa;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">GPA hiện tại / yêu cầu</span>
        <span className={cn("font-medium", met ? "text-emerald-400" : "text-amber-400")}>
          {currentGpa.toFixed(2)} / {requiredGpa.toFixed(2)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            met ? "bg-emerald-500" : "bg-amber-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!met && (
        <p className="text-xs text-amber-400/90">
          Cần đạt GPA {requiredGpa.toFixed(2)} để đủ điều kiện nhận học bổng
        </p>
      )}
    </div>
  );
}
