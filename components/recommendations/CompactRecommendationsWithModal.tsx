"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecommendationDetailModal } from "./RecommendationDetailModal";
import { Star, StarOff, Eye, Calendar, User } from "lucide-react";
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

export function CompactRecommendationsWithModal() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<
    string | null
  >(null);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

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
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isBookmarked: !currentlyBookmarked,
        }),
      });

      if (response.ok) {
        fetchRecommendations();
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter Tabs */}
      <div className="flex gap-1">
        <Button
          variant={showBookmarkedOnly ? "outline" : "secondary"}
          size="sm"
          onClick={() => setShowBookmarkedOnly(false)}
          className="text-xs h-7 px-2 flex-1"
        >
          All
        </Button>
        <Button
          variant={showBookmarkedOnly ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowBookmarkedOnly(true)}
          className="text-xs h-7 px-2 flex-1"
        >
          <Star className="h-3 w-3 mr-1" />
          Saved
        </Button>
      </div>

      {/* Recommendations List */}
      <div className="space-y-2">
        {recommendations.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">
            {showBookmarkedOnly
              ? "No bookmarked recommendations yet."
              : "No recommendations saved yet."}
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="border rounded-lg p-2 space-y-2 hover:bg-gray-50/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium leading-tight text-foreground">
                    {truncateText(rec.title, 40)}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <User className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {truncateText(rec.assessment.subjectName, 15)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmark(rec.id, rec.isBookmarked)}
                  className="h-6 w-6 p-0 hover:bg-yellow-50"
                >
                  {rec.isBookmarked ? (
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-3 w-3" />
                  )}
                </Button>
              </div>

              {/* Content Preview */}
              <p className="text-xs text-gray-600 leading-relaxed">
                {truncateText(rec.content.replace(/[#*\[\]]/g, ""), 60)}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {rec.category && (
                    <Badge variant="secondary" className="text-xs h-4 px-1">
                      {rec.category === "AI Generated" ? "AI" : rec.category}
                    </Badge>
                  )}
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Calendar className="h-2.5 w-2.5" />
                    {format(new Date(rec.createdAt), "MMM dd")}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRecommendationId(rec.id)}
                  className="h-5 px-2 text-xs"
                >
                  <Eye className="h-2.5 w-2.5 mr-1" />
                  View
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <RecommendationDetailModal
        recommendationId={selectedRecommendationId}
        isOpen={!!selectedRecommendationId}
        onClose={() => setSelectedRecommendationId(null)}
        onBookmarkToggle={() => fetchRecommendations()}
      />
    </div>
  );
}
