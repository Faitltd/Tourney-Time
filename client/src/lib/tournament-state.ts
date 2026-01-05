import { useState, useCallback } from "react";
import type { Bracket, Prediction, Citation, Matchup, Recommendation } from "@shared/schema";

export interface TournamentState {
  sport: string;
  tournament: string;
  bracket: Bracket | null;
  currentRound: number;
  currentMatchupIndex: number;
  research: string;
  citations: Citation[];
  recommendation: Recommendation | null;
  predictions: Prediction[];
  loading: boolean;
  researchLoading: boolean;
}

const initialState: TournamentState = {
  sport: "",
  tournament: "",
  bracket: null,
  currentRound: 0,
  currentMatchupIndex: 0,
  research: "",
  citations: [],
  recommendation: null,
  predictions: [],
  loading: false,
  researchLoading: false,
};

export function useTournamentState() {
  const [state, setState] = useState<TournamentState>(initialState);

  const setSport = useCallback((sport: string) => {
    setState((prev) => ({ ...prev, sport }));
  }, []);

  const setTournament = useCallback((tournament: string) => {
    setState((prev) => ({ ...prev, tournament }));
  }, []);

  const setBracket = useCallback((bracket: Bracket | null, sport?: string, tournament?: string) => {
    setState((prev) => ({ 
      ...prev, 
      bracket,
      sport: sport || bracket?.sport || prev.sport,
      tournament: tournament || bracket?.tournament || prev.tournament,
      currentRound: 0,
      currentMatchupIndex: 0,
      research: "",
      citations: [],
      recommendation: null,
      predictions: [],
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setResearchLoading = useCallback((researchLoading: boolean) => {
    setState((prev) => ({ ...prev, researchLoading }));
  }, []);

  const setResearch = useCallback((research: string, citations: Citation[], recommendation?: Recommendation | null) => {
    setState((prev) => ({ ...prev, research, citations, recommendation: recommendation ?? null }));
  }, []);

  const clearResearch = useCallback(() => {
    setState((prev) => ({ ...prev, research: "", citations: [], recommendation: null }));
  }, []);

  const getCurrentMatchup = useCallback((): Matchup | null => {
    if (!state.bracket) return null;
    const round = state.bracket.rounds[state.currentRound];
    if (!round) return null;
    return round.matchups[state.currentMatchupIndex] || null;
  }, [state.bracket, state.currentRound, state.currentMatchupIndex]);

  const addPrediction = useCallback((winner: string) => {
    const matchup = getCurrentMatchup();
    if (!matchup || !state.bracket) return;

    const prediction: Prediction = {
      id: `${Date.now()}`,
      round: state.bracket.rounds[state.currentRound].roundName,
      team1: matchup.team1,
      team2: matchup.team2,
      winner,
      research: state.research,
      citations: state.citations,
      timestamp: new Date().toISOString(),
    };

    setState((prev) => {
      const newPredictions = [...prev.predictions, prediction];
      const currentRound = prev.bracket!.rounds[prev.currentRound];
      const nextMatchupIndex = prev.currentMatchupIndex + 1;

      if (nextMatchupIndex < currentRound.matchups.length) {
        return {
          ...prev,
          predictions: newPredictions,
          currentMatchupIndex: nextMatchupIndex,
          research: "",
          citations: [],
          recommendation: null,
        };
      } else {
        const nextRound = prev.currentRound + 1;
        if (nextRound < prev.bracket!.rounds.length) {
          return {
            ...prev,
            predictions: newPredictions,
            currentRound: nextRound,
            currentMatchupIndex: 0,
            research: "",
            citations: [],
            recommendation: null,
          };
        } else {
          return {
            ...prev,
            predictions: newPredictions,
            research: "",
            citations: [],
            recommendation: null,
          };
        }
      }
    });
  }, [getCurrentMatchup, state.bracket, state.currentRound, state.research, state.citations]);

  const getTotalMatchups = useCallback((): number => {
    if (!state.bracket) return 0;
    return state.bracket.rounds.reduce((sum, round) => sum + round.matchups.length, 0);
  }, [state.bracket]);

  const getCompletedMatchups = useCallback((): number => {
    return state.predictions.length;
  }, [state.predictions]);

  const isComplete = useCallback((): boolean => {
    return getTotalMatchups() > 0 && getCompletedMatchups() >= getTotalMatchups();
  }, [getTotalMatchups, getCompletedMatchups]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
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
  };
}
