
"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Teacher, Language } from '@/types';
import { getTeachersService, getLanguagesService } from '@/lib/data-service';
import { Card, CardContent } from '@/components/ui/card';
import { FilterIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


export interface CalendarFilters {
  teacherId?: string;
  languageId?: string;
  highlightConflicts: boolean;
}

interface FilterControlsProps {
  filters: CalendarFilters;
  onFiltersChange: (newFilters: CalendarFilters) => void;
}

export function FilterControls({ filters, onFiltersChange }: FilterControlsProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [teachersData, languagesData] = await Promise.all([
          getTeachersService(),
          getLanguagesService()
        ]);
        setTeachers(teachersData);
        setLanguages(languagesData);
      } catch (error) {
        console.error("Failed to load filter data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleTeacherChange = (teacherId: string) => {
    onFiltersChange({ ...filters, teacherId: teacherId === "all" ? undefined : teacherId });
  };

  const handleLanguageChange = (languageId: string) => {
    onFiltersChange({ ...filters, languageId: languageId === "all" ? undefined : languageId });
  };

  const handleConflictToggle = (checked: boolean) => {
    onFiltersChange({ ...filters, highlightConflicts: checked });
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-4 flex-grow">
            {isLoading ? (
              <>
                <div className="space-y-1 min-w-[150px]">
                  <Label htmlFor="teacher-filter">Teacher</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1 min-w-[150px]">
                  <Label htmlFor="language-filter">Language</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex items-center space-x-2 pt-5 md:pt-6">
                  <Skeleton className="h-6 w-11" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1 min-w-[150px]">
                  <Label htmlFor="teacher-filter">Teacher</Label>
                  <Select value={filters.teacherId || "all"} onValueChange={handleTeacherChange}>
                    <SelectTrigger id="teacher-filter">
                      <SelectValue placeholder="All Teachers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teachers</SelectItem>
                      {teachers.map((teacher: Teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 min-w-[150px]">
                  <Label htmlFor="language-filter">Language</Label>
                  <Select value={filters.languageId || "all"} onValueChange={handleLanguageChange}>
                    <SelectTrigger id="language-filter">
                      <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {languages.map((language: Language) => (
                        <SelectItem key={language.id} value={language.id}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 pt-5 md:pt-6">
                  <Switch
                    id="conflict-toggle"
                    checked={filters.highlightConflicts}
                    onCheckedChange={handleConflictToggle}
                  />
                  <Label htmlFor="conflict-toggle">Highlight Conflicts</Label>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
