"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RecommendationDetailModal } from "./RecommendationDetailModal";
import {
  Lightbulb,
  Star,
  StarOff,
  Calendar,
  ExternalLink,
  Target,
  AlertTriangle,
  CheckCircle,
  User,
  BarChart3,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

interface Recommendation {
  id: string;
  title: string;
  content: string;
  category?: string;
  priority: number;
  isBookmarked: boolean;
  createdAt: string;
  assessment: {
    id: string;
    subjectName: string;
    completedAt?: string;
    scores?: Array<{
      domain: string;
      riskLevel: string;
      rawScore: number;
      totalPossible: number;
    }>;
  };
}

export function RecommendationsSidebar() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchRecommendations();
  }, [showBookmarkedOnly]);

  const fetchRecommendations = async () => {
    try {
      const url = showBookmarkedOnly
        ? "/api/recommendations?bookmarked=true&limit=5"
        : "/api/recommendations?limit=5";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (id: string, currentlyBookmarked: boolean) => {
    try {
      const response = await fetch(`/api/recommendations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isBookmarked: !currentlyBookmarked,
        }),
      });

      if (response.ok) {
        fetchRecommendations(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return "text-green-600 bg-green-50";
      case "MODERATE":
        return "text-yellow-600 bg-yellow-50";
      case "HIGH":
        return "text-orange-600 bg-orange-50";
      case "VERY_HIGH":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return CheckCircle;
      case "MODERATE":
      case "HIGH":
      case "VERY_HIGH":
        return AlertTriangle;
      default:
        return Target;
    }
  };

  const getDomainDisplayName = (domain: string) => {
    const domainNames: Record<string, string> = {
      ANTISOCIAL: "Social",
      VIOLENCE: "Aggression",
      ATTENTION: "Attention",
      EMOTIONAL: "Emotional",
      CONDUCT: "Conduct",
    };
    return domainNames[domain] || domain;
  };

  const extractDomainSpecificContent = (content: string, domain?: string) => {
    if (!domain) return content;

    // Look for domain-specific sections in the content
    const lines = content.split("\n");
    const domainSection = lines.find(
      (line) =>
        line.toLowerCase().includes(domain.toLowerCase()) ||
        line.toLowerCase().includes(getDomainDisplayName(domain).toLowerCase())
    );

    if (domainSection) {
      // Find the next few lines after the domain section
      const startIndex = lines.indexOf(domainSection);
      const relevantLines = lines.slice(startIndex, startIndex + 3);
      return relevantLines.join("\n").substring(0, 200) + "...";
    }

    return content.substring(0, 200) + "...";
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5" />
            Saved Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading recommendations...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5" />
          Saved Recommendations
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={showBookmarkedOnly ? "outline" : "secondary"}
            size="sm"
            onClick={() => setShowBookmarkedOnly(false)}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant={showBookmarkedOnly ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowBookmarkedOnly(true)}
            className="text-xs"
          >
            <Star className="h-3 w-3 mr-1" />
            Bookmarked
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-4 pr-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {showBookmarkedOnly
                  ? "No bookmarked recommendations yet."
                  : "No recommendations saved yet. Complete an assessment to get personalized recommendations."}
              </div>
            ) : (
              recommendations.map((rec) => (
                <Card
                  key={rec.id}
                  className="border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Header with title and bookmark */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm leading-tight text-foreground">
                          {rec.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {rec.assessment.subjectName}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(rec.id, rec.isBookmarked)}
                        className="h-8 w-8 p-0 ml-2 hover:bg-yellow-50"
                      >
                        {rec.isBookmarked ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Assessment domain info */}
                    {rec.assessment.scores &&
                      rec.assessment.scores.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <BarChart3 className="h-3 w-3" />
                            <span>Assessment Domains</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {rec.assessment.scores
                              .slice(0, 3)
                              .map((score, index) => {
                                const Icon = getRiskIcon(score.riskLevel);
                                return (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className={`text-xs ${getRiskLevelColor(score.riskLevel)} border-current`}
                                  >
                                    <Icon className="h-3 w-3 mr-1" />
                                    {getDomainDisplayName(score.domain)}
                                  </Badge>
                                );
                              })}
                            {rec.assessment.scores.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{rec.assessment.scores.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                    <Separator />

                    {/* Content preview */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {truncateContent(rec.content, 120)}
                      </p>
                    </div>

                    {/* Footer with metadata and actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {rec.category && (
                          <Badge variant="secondary" className="text-xs">
                            {rec.category}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(rec.createdAt), "MMM dd, yyyy")}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRecommendationId(rec.id)}
                        className="h-7 px-3 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Detail Modal */}
      <RecommendationDetailModal
        recommendationId={selectedRecommendationId}
        isOpen={!!selectedRecommendationId}
        onClose={() => setSelectedRecommendationId(null)}
        onBookmarkToggle={() => fetchRecommendations()} // Refresh the list when bookmark status changes
      />
    </Card>
  );
}
