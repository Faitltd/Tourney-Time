import { useMemo } from "react";
import DOMPurify from "dompurify";
import { ExternalLink, TrendingUp, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Citation, Recommendation } from "@shared/schema";

interface ResearchPanelProps {
  research: string;
  citations: Citation[];
  recommendation?: Recommendation | null;
}

export function ResearchPanel({ research, citations, recommendation }: ResearchPanelProps) {
  const sanitizedResearch = useMemo(() => {
    let cleaned = research.replace(/PREDICTION:[\s\S]*?Rationale:[^\n]*/gi, "");
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, "");
    return DOMPurify.sanitize(cleaned, {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "a", "sup", "ul", "li", "ol", "h1", "h2", "h3", "h4", "span"],
      ALLOWED_ATTR: ["href", "target", "rel", "class"],
    });
  }, [research]);

  if (!research) return null;

  return (
    <Card data-testid="card-research-panel">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Research Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {recommendation && (
          <div className="p-4 rounded-md bg-primary/10 border border-primary/20" data-testid="card-ai-recommendation">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm uppercase tracking-wide">AI Recommendation</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold" data-testid="text-recommended-winner">{recommendation.winner}</span>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-confidence">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {recommendation.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-recommendation-rationale">
                  {recommendation.rationale}
                </p>
              </div>
              <div className="w-full sm:w-24">
                <Progress value={recommendation.confidence} className="h-2" />
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="max-h-[400px]">
          <div
            className="prose prose-sm dark:prose-invert max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizedResearch }}
            data-testid="text-research-content"
          />
        </ScrollArea>

        {citations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Sources
              </h4>
              <ul className="space-y-2">
                {citations.map((citation) => (
                  <li key={citation.number} className="text-sm">
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                      data-testid={`link-citation-${citation.number}`}
                    >
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded shrink-0">
                        [{citation.number}]
                      </span>
                      <span className="flex-1 break-words">
                        {citation.source && (
                          <span className="font-medium">{citation.source}</span>
                        )}
                        {citation.source && citation.title && " - "}
                        {citation.title || citation.url}
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
