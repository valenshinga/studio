
"use client";

import type { ClassEvent } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Home, BookOpen, AlertTriangle, Users as UsersIcon, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: ClassEvent;
  isConflict?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const translateEventType = (type: ClassEvent['type'] | 'unavailable'): string => {
  switch (type) {
    case 'class':
      return 'Clase';
    case 'unavailable':
      return 'No Disponible';
    case 'special':
      return 'Especial';
    default:
      // This case should ideally not be reached if types are correct
      return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Evento';
  }
};

export function EventCard({ event, isConflict = false, onEdit, onDelete }: EventCardProps) {
  // The event type from dailyEventsAndUnavailabilities can be 'unavailable'
  // which is not strictly in ClassEvent['type']. We handle it for display.
  const displayType = event.type as ClassEvent['type'] | 'unavailable';
  
  const LanguageIcon = event.language?.icon || BookOpen; // event.language might be undefined for 'unavailable'

  const cardClasses = cn(
    "mb-4 shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col",
    isConflict && "border-destructive bg-destructive/10",
    displayType === 'special' && !isConflict && "border-accent bg-accent/10",
    displayType === 'unavailable' && "border-muted-foreground bg-muted/50"
  );

  const title = event.title || (event.language && event.teacher ? `${event.language.name} con ${event.teacher.name}` : 'Evento Programado');
  const studentCount = event.studentIds?.length || 0;

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className={cn("text-lg", isConflict && "text-destructive-foreground")}>
            {title}
          </CardTitle>
          {isConflict && <AlertTriangle className="h-5 w-5 text-destructive" />}
        </div>
        <CardDescription className={cn(isConflict && "text-destructive-foreground/80")}>
          {displayType === 'unavailable' ? `Profesor(a) No Disponible: ${event.teacher?.name || 'Desconocido'}` : `${event.startTime} - ${event.endTime}`}
        </CardDescription>
      </CardHeader>
      
      {displayType !== 'unavailable' && event.language && event.teacher && (
        <CardContent className="space-y-2 text-sm flex-grow pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{event.teacher.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageIcon className="h-4 w-4 text-muted-foreground" style={{ color: event.language.color }} />
            <span>{event.language.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span>{event.classroom}</span>
          </div>
          {studentCount > 0 && displayType === 'class' && (
            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
              <span>{studentCount} alumno{studentCount > 1 ? 's' : ''}</span>
            </div>
          )}
          {event.description && (
            <p className="text-xs text-muted-foreground pt-1">{event.description}</p>
          )}
        </CardContent>
      )}
      
      {displayType === 'unavailable' && event.description && (
        <CardContent className="text-sm flex-grow pb-3">
           <p className="text-muted-foreground">{event.description}</p>
        </CardContent>
      )}

      <CardFooter className="pt-2 pb-3 flex flex-col items-stretch gap-2 sm:flex-row sm:justify-between">
        <Badge 
            variant={isConflict ? "destructive" : displayType === 'special' ? "default" : "secondary"} 
            className={cn(displayType === 'special' && !isConflict && "bg-accent text-accent-foreground", "mb-2 sm:mb-0")}
        >
            {translateEventType(displayType)}
        </Badge>
        {displayType !== 'unavailable' && (
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="mr-1 h-3.5 w-3.5" /> Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Eliminar
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
