"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Filters {
  gradeLevel?: string;
  classroomId?: string;
  dateFrom?: string;
  dateTo?: string;
  flaggedOnly?: boolean;
}

interface DistrictFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  userRole: string;
}

export function DistrictFilters({
  filters,
  onFiltersChange,
  userRole,
}: DistrictFiltersProps) {
  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      gradeLevel: undefined,
      classroomId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      flaggedOnly: false,
    });
  };

  const hasActiveFilters =
    filters.gradeLevel ||
    filters.classroomId ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.flaggedOnly;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grade-filter" className="text-xs">
              Grade Level
            </Label>
            <Select
              value={filters.gradeLevel || "all"}
              onValueChange={(value) =>
                updateFilter("gradeLevel", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger id="grade-filter" className="h-9">
                <SelectValue placeholder="All grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All grades</SelectItem>
                <SelectItem value="K">Kindergarten</SelectItem>
                <SelectItem value="1">1st Grade</SelectItem>
                <SelectItem value="2">2nd Grade</SelectItem>
                <SelectItem value="3">3rd Grade</SelectItem>
                <SelectItem value="4">4th Grade</SelectItem>
                <SelectItem value="5">5th Grade</SelectItem>
                <SelectItem value="6">6th Grade</SelectItem>
                <SelectItem value="7">7th Grade</SelectItem>
                <SelectItem value="8">8th Grade</SelectItem>
                <SelectItem value="9">9th Grade</SelectItem>
                <SelectItem value="10">10th Grade</SelectItem>
                <SelectItem value="11">11th Grade</SelectItem>
                <SelectItem value="12">12th Grade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-from" className="text-xs">
              From Date
            </Label>
            <input
              id="date-from"
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) =>
                updateFilter("dateFrom", e.target.value || undefined)
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-to" className="text-xs">
              To Date
            </Label>
            <input
              id="date-to"
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) =>
                updateFilter("dateTo", e.target.value || undefined)
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Show Only</Label>
            <div className="flex items-center space-x-2 h-9">
              <Switch
                id="flagged-only"
                checked={filters.flaggedOnly || false}
                onCheckedChange={(checked) =>
                  updateFilter("flaggedOnly", checked)
                }
              />
              <Label
                htmlFor="flagged-only"
                className="text-sm font-normal cursor-pointer"
              >
                Flagged Students
              </Label>
            </div>
          </div>

          <div className="flex items-end">
            <div className="text-xs text-muted-foreground">
              {hasActiveFilters ? (
                <span className="text-primary font-medium">Filters active</span>
              ) : (
                <span>No filters applied</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
