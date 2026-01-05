import { Check, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Prediction } from "@shared/schema";

interface PredictionsListProps {
  predictions: Prediction[];
}

export function PredictionsList({ predictions }: PredictionsListProps) {
  if (predictions.length === 0) {
    return (
      <Card data-testid="card-predictions-empty">
        <CardHeader>
          <CardTitle className="text-lg">Your Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No predictions yet. Research matchups and pick winners to build your bracket.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-predictions-list">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          Your Predictions
          <Badge variant="secondary" size="sm">
            {predictions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[calc(100vh-300px)]">
          <div className="space-y-1 p-4 pt-0">
            {predictions.map((prediction, index) => (
              <div
                key={prediction.id}
                className="p-3 rounded-md bg-muted/50"
                data-testid={`card-prediction-${index}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      {prediction.round}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {prediction.team1} vs {prediction.team2}
                    </p>
                    <p className="font-semibold mt-1" data-testid={`text-winner-${index}`}>
                      {prediction.winner}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(prediction.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
