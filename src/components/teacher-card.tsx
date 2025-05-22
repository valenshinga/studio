
"use client";

import type { Teacher } from '@/types';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeacherCardProps {
  teacher: Teacher;
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-20 w-20">
            <AvatarImage src={teacher.avatarUrl} alt={teacher.name} data-ai-hint="person avatar" />
            <AvatarFallback className="text-2xl">{getInitials(teacher.name)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl">{teacher.name}</CardTitle>
          <CardDescription>Especialista en Idiomas</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">Enseña:</h4>
        <div className="flex flex-wrap gap-2">
          {teacher.languagesTaught.map((lang) => {
            const LanguageIcon = lang.icon || BookOpen;
            return (
              <Badge key={lang.id} variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5" style={{ backgroundColor: lang.color ? `${lang.color}20` : undefined, borderColor: lang.color, color: lang.color ? undefined : 'hsl(var(--foreground))' }}>
                <LanguageIcon className="h-3.5 w-3.5" style={{ color: lang.color }} />
                {lang.name}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
