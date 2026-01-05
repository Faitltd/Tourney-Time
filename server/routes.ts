import type { Express } from "express";
import { createServer, type Server } from "http";
import {
  tournamentRequestSchema,
  matchupRequestSchema,
  type BracketResponse,
  type MatchupResponse,
  type Bracket,
  type Citation,
} from "@shared/schema";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

async function callPerplexity(prompt: string): Promise<{ content: string; citations: string[] }> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is not configured");
  }

  const response = await fetch(PERPLEXITY_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: "You are a sports research assistant. Provide accurate, well-sourced information about sports tournaments, teams, and matchups. Be concise but comprehensive.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: "week",
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  const citations = data.citations || [];

  return { content, citations };
}

function parseBracketFromResponse(content: string, sport: string, tournament: string): Bracket {
  console.log("Parsing bracket from content length:", content.length);
  const lines = content.split("\n").filter(line => line.trim());
  const rounds: Bracket["rounds"] = [];
  let currentRound: { roundName: string; matchups: { team1: string; team2: string; seed1?: number; seed2?: number; date?: string; time?: string }[] } | null = null;

  const roundPatterns = [
    /first\s*round/i,
    /round\s*of\s*(\d+)/i,
    /round\s*1/i,
    /second\s*round/i,
    /sweet\s*(?:16|sixteen)/i,
    /elite\s*(?:8|eight)/i,
    /final\s*four/i,
    /championship/i,
    /semifinals?/i,
    /quarterfinals?/i,
    /wild\s*card/i,
    /divisional/i,
    /conference\s*(?:finals?|semifinals?)/i,
    /nba\s*finals?/i,
    /super\s*bowl/i,
    /opening\s*round/i,
    /eastern\s*conference/i,
    /western\s*conference/i,
    /playoffs/i,
  ];

  const matchupPatterns = [
    /(?:#?(\d+)\s+)?([A-Za-z0-9\s\.\-']+?)\s+(?:vs\.?|versus|v\.|at|@)\s+(?:#?(\d+)\s+)?([A-Za-z0-9\s\.\-']+)/i,
    /\((\d+)\)\s*([A-Za-z0-9\s\.\-']+?)\s+(?:vs\.?|versus|v\.)\s+\((\d+)\)\s*([A-Za-z0-9\s\.\-']+)/i,
  ];

  // Function to extract date and time from a line
  function extractDateTime(line: string): { date?: string; time?: string } {
    let date: string | undefined;
    let time: string | undefined;

    // Look for separator (-, –, —, or at the end after team names)
    const afterSeparator = line.split(/[-–—]/).slice(1).join("-");
    const searchText = afterSeparator || line;

    // Date patterns - flexible to match various formats
    const datePatterns = [
      // Full month with optional year: "January 5, 2025" or "January 5"
      /\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:-\d{1,2})?(?:,?\s*\d{4})?)\b/i,
      // Abbreviated month: "Jan. 5, 2025" or "Jan 5"
      /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+\d{1,2}(?:-\d{1,2})?(?:,?\s*\d{4})?)\b/i,
      // Numeric format: "1/5/2025" or "01-05-2025"
      /\b(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\b/,
    ];

    for (const pattern of datePatterns) {
      const match = searchText.match(pattern);
      if (match) {
        date = match[1].trim();
        break;
      }
    }

    // Time patterns - flexible to match various formats
    const timePatterns = [
      // Standard time: "5:00 PM ET", "5:00PM", "5:00 p.m."
      /\b(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm|a\.m\.|p\.m\.)?(?:\s*(?:ET|PT|CT|MT|EST|PST|CST|MST|Eastern|Pacific))?)\b/i,
      // Time without colon: "5 PM ET", "3PM"
      /\b(\d{1,2}\s*(?:AM|PM|am|pm|a\.m\.|p\.m\.)(?:\s*(?:ET|PT|CT|MT|EST|PST|CST|MST|Eastern|Pacific))?)\b/i,
    ];

    for (const pattern of timePatterns) {
      const match = searchText.match(pattern);
      if (match) {
        time = match[1].trim();
        break;
      }
    }

    return { date, time };
  }

  for (const line of lines) {
    let isRound = false;
    for (const pattern of roundPatterns) {
      if (pattern.test(line)) {
        if (currentRound && currentRound.matchups.length > 0) {
          rounds.push(currentRound);
        }
        let roundName = line.replace(/^[*#\-:\s]+/, "").trim();
        roundName = roundName.replace(/^\d+\.\s*/, "");
        roundName = roundName.replace(/[*#]+/g, "").trim();
        currentRound = { roundName, matchups: [] };
        isRound = true;
        break;
      }
    }

    if (!isRound && currentRound) {
      for (const pattern of matchupPatterns) {
        const match = line.match(pattern);
        if (match) {
          let team1 = "", team2 = "";
          let seed1: number | undefined, seed2: number | undefined;

          if (match.length >= 5) {
            seed1 = match[1] ? parseInt(match[1]) : undefined;
            team1 = match[2]?.trim() || "";
            seed2 = match[3] ? parseInt(match[3]) : undefined;
            team2 = match[4]?.trim() || "";
          } else if (match.length >= 3) {
            team1 = match[1]?.trim() || "";
            team2 = match[2]?.trim() || "";
          }

          if (team1 && team2 && team1.length > 1 && team2.length > 1) {
            team1 = team1.replace(/[*#\-:]+$/, "").trim();
            team2 = team2.replace(/[*#\-:]+$/, "").trim();
            
            if (team1.length <= 50 && team2.length <= 50) {
              // Extract date/time from the line
              const { date, time } = extractDateTime(line);
              
              currentRound.matchups.push({ team1, team2, seed1, seed2, date, time });
            }
          }
          break;
        }
      }
    }
  }

  if (currentRound && currentRound.matchups.length > 0) {
    rounds.push(currentRound);
  }

  if (rounds.length === 0) {
    const vsMatches = content.match(/([A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(?:vs\.?|versus|v\.)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)/gi);
    if (vsMatches && vsMatches.length > 0) {
      const matchups: { team1: string; team2: string }[] = [];
      for (const matchStr of vsMatches.slice(0, 16)) {
        const parts = matchStr.split(/\s+(?:vs\.?|versus|v\.)\s+/i);
        if (parts.length >= 2) {
          const team1 = parts[0].trim();
          const team2 = parts[1].trim();
          if (team1 && team2 && team1.length > 1 && team2.length > 1 && team1.length <= 50 && team2.length <= 50) {
            matchups.push({ team1, team2 });
          }
        }
      }
      if (matchups.length > 0) {
        rounds.push({ roundName: "First Round", matchups });
      }
    }
  }

  if (rounds.length === 0) {
    console.log("No rounds parsed, using fallback bracket");
    rounds.push({
      roundName: "First Round",
      matchups: [
        { team1: "Team A", team2: "Team B" },
        { team1: "Team C", team2: "Team D" },
      ],
    });
  }

  console.log("Parsed bracket with", rounds.length, "rounds and", rounds.reduce((sum, r) => sum + r.matchups.length, 0), "total matchups");
  
  return {
    tournament,
    sport,
    rounds,
  };
}

function parseRecommendation(content: string, team1: string, team2: string): { winner: string; confidence: number; rationale: string } | undefined {
  const predictionMatch = content.match(/PREDICTION:[\s\S]*?Winner:\s*([^\n]+)/i);
  const confidenceMatch = content.match(/Confidence:\s*(\d+)/i);
  const rationaleMatch = content.match(/Rationale:\s*([^\n]+)/i);

  if (predictionMatch) {
    let winner = predictionMatch[1].trim();
    winner = winner.replace(/\*\*/g, "").replace(/[*#\-:]+$/, "").trim();

    const team1Lower = team1.toLowerCase();
    const team2Lower = team2.toLowerCase();
    const winnerLower = winner.toLowerCase();

    if (winnerLower.includes(team1Lower) || team1Lower.includes(winnerLower)) {
      winner = team1;
    } else if (winnerLower.includes(team2Lower) || team2Lower.includes(winnerLower)) {
      winner = team2;
    }

    const confidence = confidenceMatch ? Math.min(100, Math.max(0, parseInt(confidenceMatch[1]))) : 70;
    const rationale = rationaleMatch ? rationaleMatch[1].trim() : "Based on overall analysis of recent performance and matchup factors.";

    return { winner, confidence, rationale };
  }

  const team1Mentions = (content.match(new RegExp(team1, "gi")) || []).length;
  const team2Mentions = (content.match(new RegExp(team2, "gi")) || []).length;
  const favoredMatch = content.match(/favou?red|expected to win|likely to win|should win|projected winner/i);

  if (favoredMatch) {
    const context = content.substring(Math.max(0, content.indexOf(favoredMatch[0]) - 100), content.indexOf(favoredMatch[0]) + 100);
    if (context.toLowerCase().includes(team1.toLowerCase())) {
      return { winner: team1, confidence: 60, rationale: "Based on expert analysis indicating this team is favored." };
    } else if (context.toLowerCase().includes(team2.toLowerCase())) {
      return { winner: team2, confidence: 60, rationale: "Based on expert analysis indicating this team is favored." };
    }
  }

  return undefined;
}

function formatResearchWithCitations(content: string, citations: string[]): { research: string; formattedCitations: Citation[] } {
  let formattedContent = content;
  const formattedCitations: Citation[] = [];

  citations.forEach((url, index) => {
    const citationNumber = index + 1;
    let source = "Source";
    try {
      const urlObj = new URL(url);
      source = urlObj.hostname.replace("www.", "");
    } catch {
      source = "Source";
    }

    formattedCitations.push({
      number: citationNumber,
      url,
      source,
      title: `Reference ${citationNumber}`,
    });
  });

  formattedContent = formattedContent.replace(/\n\n/g, "</p><p>");
  formattedContent = formattedContent.replace(/\n/g, "<br>");
  formattedContent = `<p>${formattedContent}</p>`;

  formattedContent = formattedContent.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  formattedContent = formattedContent.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  for (let i = citations.length; i >= 1; i--) {
    const citationRef = new RegExp(`\\[${i}\\]`, "g");
    formattedContent = formattedContent.replace(
      citationRef,
      `<sup><a href="${citations[i - 1]}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">[${i}]</a></sup>`
    );
  }

  return { research: formattedContent, formattedCitations };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/research", async (req, res) => {
    try {
      const parseResult = tournamentRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.message });
      }

      const { sport, tournament } = parseResult.data;

      const prompt = `Find the current bracket/lineup for the ${tournament} ${sport} tournament. Search for the latest official bracket announcements, matchups, seeds, and participating teams. List each round and the matchups within each round. For each matchup, include the scheduled date and time if available. Format: Round Name followed by matchups in "Team A vs Team B - Date, Time" format (e.g., "Ohio State vs Oregon - January 1, 2025, 5:00 PM ET").`;

      const { content, citations } = await callPerplexity(prompt);
      const bracket = parseBracketFromResponse(content, sport, tournament);
      const { research, formattedCitations } = formatResearchWithCitations(content, citations);

      const response: BracketResponse = {
        research,
        bracket,
      };

      res.json(response);
    } catch (error) {
      console.error("Research endpoint error:", error);
      const message = error instanceof Error ? error.message : "Failed to research tournament";
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/matchup", async (req, res) => {
    try {
      const parseResult = matchupRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.message });
      }

      const { team1, team2, sport, tournament } = parseResult.data;

      const contextStr = sport && tournament ? ` in the ${tournament} ${sport}` : "";
      const prompt = `Research the matchup between ${team1} and ${team2}${contextStr}. Provide:
1) Recent performance stats and records for both teams
2) Head-to-head history (recent games if any)
3) Key player injuries or availability issues
4) Expert predictions and betting lines if available
5) Recent news affecting either team

After your analysis, you MUST provide a prediction in exactly this format at the end:

PREDICTION:
Winner: [exact team name - must be either "${team1}" or "${team2}"]
Confidence: [number 1-100]
Rationale: [one sentence explaining your pick]

Base your prediction on the data you found. Be decisive.`;

      const { content, citations } = await callPerplexity(prompt);
      const { research, formattedCitations } = formatResearchWithCitations(content, citations);

      const recommendation = parseRecommendation(content, team1, team2);

      const response: MatchupResponse = {
        research,
        citations: formattedCitations,
        recommendation,
      };

      res.json(response);
    } catch (error) {
      console.error("Matchup endpoint error:", error);
      const message = error instanceof Error ? error.message : "Failed to research matchup";
      res.status(500).json({ error: message });
    }
  });

  return httpServer;
}
