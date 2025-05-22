
"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Teacher, Language } from '@/types';
import { mockTeachers, mockLanguages } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { FilterIcon } from 'lucide-react';

export interface CalendarFilters {
  teacherId?: string;
  languageId?: string;
  highlightConflicts: boolean;
}

interface FilterControlsProps {
  filters: CalendarFilters;
  onFiltersChange: (newFilters: CalendarFilters) => void;
}

// Directly use mock data
const allTeachersData: Teacher[] = mockTeachers;
const allLanguagesData: Language[] = mockLanguages;

export function FilterControls({ filters, onFiltersChange }: FilterControlsProps) {
  // Initialize state directly with mock data
  const [teachers, setTeachers] = useState<Teacher[]>(allTeachersData);
  const [languages, setLanguages] = useState<Language[]>(allLanguagesData);
  
  // No isLoading state needed as data is synchronous

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
            <h3 className="text-lg font-semibold">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-4 flex-grow">
            <>
              <div className="space-y-1 min-w-[150px]">
                <Label htmlFor="teacher-filter">Profesor(a)</Label>
                <Select value={filters.teacherId || "all"} onValueChange={handleTeacherChange}>
                  <SelectTrigger id="teacher-filter">
                    <SelectValue placeholder="Todos los Profesores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Profesores</SelectItem>
                    {teachers.map((teacher: Teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 min-w-[150px]">
                <Label htmlFor="language-filter">Idioma</Label>
                <Select value={filters.languageId || "all"} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language-filter">
                    <SelectValue placeholder="Todos los Idiomas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Idiomas</SelectItem>
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
                <Label htmlFor="conflict-toggle">Resaltar Conflictos</Label>
              </div>
            </>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
