import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  currentRound: number;
  totalRounds: number;
  completedMatchups: number;
  totalMatchups: number;
  currentRoundName: string;
}

export function ProgressIndicator({
  currentRound,
  totalRounds,
  completedMatchups,
  totalMatchups,
  currentRoundName,
}: ProgressIndicatorProps) {
  const progress = totalMatchups > 0 ? (completedMatchups / totalMatchups) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-foreground" data-testid="text-round-info">
          Round {currentRound + 1} of {totalRounds}
        </span>
        <span className="text-muted-foreground" data-testid="text-matchup-count">
          {completedMatchups}/{totalMatchups} matchups complete
        </span>
      </div>
      <Progress value={progress} className="h-2" data-testid="progress-bar" />
      <p className="text-xs text-muted-foreground text-center" data-testid="text-current-round">
        {currentRoundName}
      </p>
    </div>
  );
}
