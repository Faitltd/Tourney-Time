import { Trophy, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Prediction, Bracket } from "@shared/schema";

interface CompletionScreenProps {
  bracket: Bracket;
  predictions: Prediction[];
  onReset: () => void;
}

export function CompletionScreen({
  bracket,
  predictions,
  onReset,
}: CompletionScreenProps) {
  const downloadBracket = () => {
    const data = {
      tournament: bracket.tournament,
      sport: bracket.sport,
      predictions: predictions.map((p) => ({
        round: p.round,
        matchup: `${p.team1} vs ${p.team2}`,
        winner: p.winner,
      })),
      generatedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bracket.tournament.replace(/\s+/g, "-").toLowerCase()}-predictions.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-lg text-center" data-testid="card-completion">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Bracket Complete</CardTitle>
            <CardDescription className="text-base mt-2">
              You've made all {predictions.length} predictions for {bracket.tournament}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-predictions">
                {predictions.length}
              </p>
              <p className="text-xs text-muted-foreground">Predictions Made</p>
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-rounds">
                {bracket.rounds.length}
              </p>
              <p className="text-xs text-muted-foreground">Rounds Completed</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={downloadBracket}
              className="flex-1"
              data-testid="button-download"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Bracket
            </Button>
            <Button onClick={onReset} className="flex-1" data-testid="button-new-tournament">
              <RotateCcw className="w-4 h-4 mr-2" />
              New Tournament
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
