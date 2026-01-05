import { Search, Loader2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Matchup } from "@shared/schema";

interface CurrentMatchupProps {
  matchup: Matchup;
  roundName: string;
  onResearch: () => void;
  researchLoading: boolean;
  hasResearch: boolean;
}

export function CurrentMatchup({
  matchup,
  roundName,
  onResearch,
  researchLoading,
  hasResearch,
}: CurrentMatchupProps) {
  return (
    <Card className="border-2 border-primary/20 bg-card" data-testid="card-current-matchup">
      <CardContent className="p-6">
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center gap-2">
            <Badge variant="secondary" className="text-xs uppercase tracking-wide">
              {roundName}
            </Badge>
            {(matchup.date || matchup.time) && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {matchup.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {matchup.date}
                  </span>
                )}
                {matchup.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {matchup.time}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="text-center min-w-[120px]">
              {matchup.seed1 && (
                <span className="text-xs text-muted-foreground font-mono">
                  #{matchup.seed1}
                </span>
              )}
              <h3 className="text-xl font-semibold" data-testid="text-team1">
                {matchup.team1}
              </h3>
            </div>
            
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
              <span className="text-sm font-medium text-muted-foreground">VS</span>
            </div>
            
            <div className="text-center min-w-[120px]">
              {matchup.seed2 && (
                <span className="text-xs text-muted-foreground font-mono">
                  #{matchup.seed2}
                </span>
              )}
              <h3 className="text-xl font-semibold" data-testid="text-team2">
                {matchup.team2}
              </h3>
            </div>
          </div>

          {!hasResearch && (
            <Button
              onClick={onResearch}
              disabled={researchLoading}
              className="w-full sm:w-auto"
              data-testid="button-research-matchup"
            >
              {researchLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Researching matchup...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Research This Matchup
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
