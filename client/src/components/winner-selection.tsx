import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Matchup, Recommendation } from "@shared/schema";

interface WinnerSelectionProps {
  matchup: Matchup;
  onSelect: (winner: string) => void;
  recommendation?: Recommendation | null;
}

export function WinnerSelection({ matchup, onSelect, recommendation }: WinnerSelectionProps) {
  const isTeam1Recommended = recommendation?.winner === matchup.team1;
  const isTeam2Recommended = recommendation?.winner === matchup.team2;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={() => onSelect(matchup.team1)}
        className={`flex-1 relative ${isTeam1Recommended ? "ring-2 ring-primary ring-offset-2" : ""}`}
        size="lg"
        variant={isTeam1Recommended ? "default" : "outline"}
        data-testid="button-pick-team1"
      >
        {isTeam1Recommended && (
          <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5">
            <Sparkles className="w-3 h-3 mr-0.5" />
            AI Pick
          </Badge>
        )}
        <Check className="w-4 h-4 mr-2" />
        Pick {matchup.team1}
      </Button>
      <Button
        onClick={() => onSelect(matchup.team2)}
        className={`flex-1 relative ${isTeam2Recommended ? "ring-2 ring-primary ring-offset-2" : ""}`}
        size="lg"
        variant={isTeam2Recommended ? "default" : "outline"}
        data-testid="button-pick-team2"
      >
        {isTeam2Recommended && (
          <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5">
            <Sparkles className="w-3 h-3 mr-0.5" />
            AI Pick
          </Badge>
        )}
        <Check className="w-4 h-4 mr-2" />
        Pick {matchup.team2}
      </Button>
    </div>
  );
}
