import { Check, Clock, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Bracket, Prediction } from "@shared/schema";

interface BracketVisualizationProps {
  bracket: Bracket;
  predictions: Prediction[];
  currentRound: number;
  currentMatchupIndex: number;
}

export function BracketVisualization({
  bracket,
  predictions,
  currentRound,
  currentMatchupIndex,
}: BracketVisualizationProps) {
  const getPredictionForMatchup = (
    roundName: string,
    team1: string,
    team2: string
  ): Prediction | undefined => {
    return predictions.find(
      (p) => p.round === roundName && p.team1 === team1 && p.team2 === team2
    );
  };

  const isCurrentMatchup = (
    roundIndex: number,
    matchupIndex: number
  ): boolean => {
    return roundIndex === currentRound && matchupIndex === currentMatchupIndex;
  };

  const isPastMatchup = (roundIndex: number, matchupIndex: number): boolean => {
    if (roundIndex < currentRound) return true;
    if (roundIndex === currentRound && matchupIndex < currentMatchupIndex) return true;
    return false;
  };

  return (
    <Card data-testid="card-bracket">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {bracket.tournament}
          <Badge variant="secondary" size="sm">
            {bracket.sport}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="flex gap-4 p-4 pt-0 min-w-max">
            {bracket.rounds.map((round, roundIndex) => (
              <div
                key={roundIndex}
                className="flex-shrink-0 w-64"
                data-testid={`bracket-round-${roundIndex}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold">{round.roundName}</h3>
                  <Badge variant="outline" size="sm">
                    {round.matchups.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {round.matchups.map((matchup, matchupIndex) => {
                    const prediction = getPredictionForMatchup(
                      round.roundName,
                      matchup.team1,
                      matchup.team2
                    );
                    const isCurrent = isCurrentMatchup(roundIndex, matchupIndex);
                    const isPast = isPastMatchup(roundIndex, matchupIndex);

                    return (
                      <div
                        key={matchupIndex}
                        className={`
                          p-3 rounded-md border transition-all
                          ${isCurrent ? "border-primary bg-primary/5 ring-1 ring-primary/20" : ""}
                          ${prediction ? "bg-muted/50 border-muted" : ""}
                          ${!isCurrent && !prediction ? "bg-background border-border" : ""}
                        `}
                        data-testid={`matchup-${roundIndex}-${matchupIndex}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              {matchup.seed1 && (
                                <span className="text-xs text-muted-foreground font-mono w-4">
                                  {matchup.seed1}
                                </span>
                              )}
                              <span
                                className={`text-sm truncate ${
                                  prediction?.winner === matchup.team1
                                    ? "font-semibold"
                                    : ""
                                }`}
                              >
                                {matchup.team1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {matchup.seed2 && (
                                <span className="text-xs text-muted-foreground font-mono w-4">
                                  {matchup.seed2}
                                </span>
                              )}
                              <span
                                className={`text-sm truncate ${
                                  prediction?.winner === matchup.team2
                                    ? "font-semibold"
                                    : ""
                                }`}
                              >
                                {matchup.team2}
                              </span>
                            </div>
                            {(matchup.date || matchup.time) && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {matchup.date}
                                  {matchup.date && matchup.time && ", "}
                                  {matchup.time}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="shrink-0">
                            {prediction ? (
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary" />
                              </div>
                            ) : isCurrent ? (
                              <ChevronRight className="w-4 h-4 text-primary" />
                            ) : (
                              <Clock className="w-4 h-4 text-muted-foreground/50" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
