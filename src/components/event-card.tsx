
"use client";

import type { ClassEvent } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Home, BookOpen, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: ClassEvent;
  isConflict?: boolean;
}

const translateEventType = (type: ClassEvent['type']): string => {
  switch (type) {
    case 'class':
      return 'Clase';
    case 'unavailable':
      return 'No Disponible';
    case 'special':
      return 'Especial';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export function EventCard({ event, isConflict = false }: EventCardProps) {
  const LanguageIcon = event.language.icon || BookOpen;

  const cardClasses = cn(
    "mb-4 shadow-md hover:shadow-lg transition-shadow duration-200",
    isConflict && "border-destructive bg-destructive/10",
    event.type === 'special' && !isConflict && "border-accent bg-accent/10",
    event.type === 'unavailable' && "border-muted-foreground bg-muted/50"
  );

  const title = event.title || `${event.language.name} con ${event.teacher.name}`;

  return (
    <Card className={cardClasses}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className={cn("text-lg", isConflict && "text-destructive-foreground")}>
            {title}
          </CardTitle>
          {isConflict && <AlertTriangle className="h-5 w-5 text-destructive" />}
        </div>
        <CardDescription className={cn(isConflict && "text-destructive-foreground/80")}>
          {event.type === 'unavailable' ? `Profesor(a) No Disponible: ${event.teacher.name}` : `${event.startTime} - ${event.endTime}`}
        </CardDescription>
      </CardHeader>
      {event.type !== 'unavailable' && (
        <CardContent className="space-y-2 text-sm">
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
          {event.description && (
            <p className="text-xs text-muted-foreground pt-1">{event.description}</p>
          )}
          <div className="pt-2">
            <Badge variant={isConflict ? "destructive" : event.type === 'special' ? "default" : "secondary"} className={cn(event.type === 'special' && !isConflict && "bg-accent text-accent-foreground")}>
              {translateEventType(event.type)}
            </Badge>
          </div>
        </CardContent>
      )}
       {event.type === 'unavailable' && event.description && (
        <CardContent>
           <p className="text-sm text-muted-foreground">{event.description}</p>
        </CardContent>
      )}
    </Card>
  );
}
