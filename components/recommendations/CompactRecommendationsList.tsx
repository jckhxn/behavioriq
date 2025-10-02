"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, StarOff, Calendar } from "lucide-react";
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
  };
}

export function CompactRecommendationsList() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [showBookmarkedOnly]);

  const fetchRecommendations = async () => {
    try {
      const url = showBookmarkedOnly
        ? "/api/recommendations?bookmarked=true&limit=3"
        : "/api/recommendations?limit=3";
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

  const toggleBookmark = async (id: string, currentBookmarked: boolean) => {
    try {
      const response = await fetch(`/api/recommendations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBookmarked: !currentBookmarked }),
      });

      if (response.ok) {
        await fetchRecommendations();
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter buttons */}
      <div className="flex gap-1">
        <Button
          variant={showBookmarkedOnly ? "outline" : "secondary"}
          size="sm"
          onClick={() => setShowBookmarkedOnly(false)}
          className="text-xs h-6 px-2"
        >
          All
        </Button>
        <Button
          variant={showBookmarkedOnly ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowBookmarkedOnly(true)}
          className="text-xs h-6 px-2"
        >
          <Star className="h-2 w-2 mr-1" />
          Starred
        </Button>
      </div>

      {/* Recommendations list */}
      {recommendations.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-xs">
            {showBookmarkedOnly
              ? "No bookmarked recommendations yet."
              : "No recommendations available."}
          </p>
          {showBookmarkedOnly && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowBookmarkedOnly(false)}
              className="text-xs h-auto p-0 mt-2"
            >
              View all recommendations
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-2 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <h4 className="text-xs font-medium line-clamp-2 flex-1">
                  {rec.title}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmark(rec.id, rec.isBookmarked)}
                  className="h-auto w-auto p-0.5 flex-shrink-0"
                >
                  {rec.isBookmarked ? (
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-3 w-3 text-muted-foreground" />
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mb-2 line-clamp-3">
                {truncateContent(rec.content)}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {rec.category && (
                    <Badge variant="outline" className="text-xs h-4 px-1">
                      {rec.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-2 w-2" />
                  <span>{format(new Date(rec.createdAt), "MMM d")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
