import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTournamentState } from "@/lib/tournament-state";
import { TournamentSetup } from "@/components/tournament-setup";
import { ProgressIndicator } from "@/components/progress-indicator";
import { BracketVisualization } from "@/components/bracket-visualization";
import { CurrentMatchup } from "@/components/current-matchup";
import { ResearchPanel } from "@/components/research-panel";
import { WinnerSelection } from "@/components/winner-selection";
import { PredictionsList } from "@/components/predictions-list";
import { CompletionScreen } from "@/components/completion-screen";
import { ThemeToggle } from "@/components/theme-toggle";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  TournamentRequest,
  BracketResponse,
  MatchupResponse,
} from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const {
    state,
    setSport,
    setTournament,
    setBracket,
    setLoading,
    setResearchLoading,
    setResearch,
    clearResearch,
    getCurrentMatchup,
    addPrediction,
    getTotalMatchups,
    getCompletedMatchups,
    isComplete,
    reset,
  } = useTournamentState();

  const bracketMutation = useMutation({
    mutationFn: async (data: TournamentRequest) => {
      const response = await apiRequest("POST", "/api/research", data);
      return await response.json() as BracketResponse;
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      setBracket(data.bracket, data.bracket.sport, data.bracket.tournament);
      toast({
        title: "Bracket Found",
        description: `Found ${data.bracket.rounds.length} rounds with matchups to analyze.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to find bracket. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const researchMutation = useMutation({
    mutationFn: async () => {
      const matchup = getCurrentMatchup();
      if (!matchup) throw new Error("No matchup selected");

      const response = await apiRequest("POST", "/api/matchup", {
        team1: matchup.team1,
        team2: matchup.team2,
        sport: state.sport,
        tournament: state.tournament,
      });
      return await response.json() as MatchupResponse;
    },
    onMutate: () => {
      setResearchLoading(true);
    },
    onSuccess: (data) => {
      setResearch(data.research, data.citations, data.recommendation);
    },
    onError: (error: Error) => {
      toast({
        title: "Research Error",
        description: error.message || "Failed to research matchup. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setResearchLoading(false);
    },
  });

  const handleTournamentSubmit = (data: TournamentRequest) => {
    bracketMutation.mutate(data);
  };

  const handleResearch = () => {
    researchMutation.mutate();
  };

  const handleWinnerSelect = (winner: string) => {
    addPrediction(winner);
    clearResearch();
  };

  const handleReset = () => {
    reset();
  };

  const currentMatchup = getCurrentMatchup();

  if (!state.bracket) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-semibold">Tourney Time</span>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="py-8">
          <TournamentSetup
            onSubmit={handleTournamentSubmit}
            loading={state.loading}
          />
        </main>
      </div>
    );
  }

  if (isComplete()) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-semibold">Tourney Time</span>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="py-8">
          <CompletionScreen
            bracket={state.bracket}
            predictions={state.predictions}
            onReset={handleReset}
          />
        </main>
      </div>
    );
  }

  const currentRoundName =
    state.bracket.rounds[state.currentRound]?.roundName || "";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="font-semibold">Tourney Time</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              data-testid="button-reset"
            >
              New Tournament
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <ProgressIndicator
          currentRound={state.currentRound}
          totalRounds={state.bracket.rounds.length}
          completedMatchups={getCompletedMatchups()}
          totalMatchups={getTotalMatchups()}
          currentRoundName={currentRoundName}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BracketVisualization
              bracket={state.bracket}
              predictions={state.predictions}
              currentRound={state.currentRound}
              currentMatchupIndex={state.currentMatchupIndex}
            />

            {currentMatchup && (
              <>
                <CurrentMatchup
                  matchup={currentMatchup}
                  roundName={currentRoundName}
                  onResearch={handleResearch}
                  researchLoading={state.researchLoading}
                  hasResearch={!!state.research}
                />

                {state.research && (
                  <>
                    <ResearchPanel
                      research={state.research}
                      citations={state.citations}
                      recommendation={state.recommendation}
                    />

                    <WinnerSelection
                      matchup={currentMatchup}
                      onSelect={handleWinnerSelect}
                      recommendation={state.recommendation}
                    />
                  </>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <PredictionsList predictions={state.predictions} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
