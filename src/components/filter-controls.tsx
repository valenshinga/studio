
"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Clase, Docente, Lenguaje } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { FilterIcon } from 'lucide-react';
import { getDocentes, getLenguajes } from '@/lib/data';
import { Skeleton } from './ui/skeleton';

export interface CalendarFilters {
  docenteId?: string;
  lenguajeId?: string;
  highlightConflicts: boolean;
}

interface FilterControlsProps {
  filters: CalendarFilters;
  onFiltersChange: (newFilters: CalendarFilters) => void;
}


export function FilterControls({ filters, onFiltersChange }: FilterControlsProps) {
  // Initialize state with empty arrays
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [lenguajes, setLenguajes] = useState<Lenguaje[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      const docentesData = await getDocentes();
      const lenguajesData = await getLenguajes();
      setDocentes(docentesData);
      setLenguajes(lenguajesData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleTeacherChange = (docenteId: string) => {
    onFiltersChange({ ...filters, docenteId: docenteId === "all" ? undefined : docenteId });
  };

  const handleLanguageChange = (lenguajeId: string) => {
    onFiltersChange({ ...filters, lenguajeId: lenguajeId === "all" ? undefined : lenguajeId });
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
            {loading ? (
              <>
                <div className="space-y-1 min-w-[150px]">
                  <Label htmlFor="teacher-filter">Docente</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1 min-w-[150px]">
                  <Label htmlFor="language-filter">Idioma</Label>
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
                  <Label htmlFor="teacher-filter">Docente</Label>
                  <Select value={filters.docenteId || "all"} onValueChange={handleTeacherChange}>
                    <SelectTrigger id="teacher-filter">
                      <SelectValue placeholder="Todos los Docentes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Docentes</SelectItem>
                      {docentes.map((docente: Docente) => (
                        <SelectItem key={docente.id} value={docente.id}>
                          {docente.apellido}, {docente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 min-w-[150px]">
                  <Label htmlFor="language-filter">Idioma</Label>
                  <Select value={filters.lenguajeId || "all"} onValueChange={handleLanguageChange}>
                    <SelectTrigger id="language-filter">
                      <SelectValue placeholder="Todos los Idiomas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Idiomas</SelectItem>
                      {lenguajes.map((lenguaje: Lenguaje) => (
                        <SelectItem key={lenguaje.id} value={lenguaje.id}>
                          {lenguaje.nombre}
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
