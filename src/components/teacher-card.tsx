"use client";

import type { Teacher } from '@/types';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

interface TeacherCardProps {
  teacher: Teacher;
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center gap-4">
        <Image
          src={teacher.avatarUrl || `https://placehold.co/80x80.png?text=${teacher.name.substring(0,2)}`}
          alt={teacher.name}
          width={80}
          height={80}
          className="rounded-full border"
          data-ai-hint="person avatar"
        />
        <div>
          <CardTitle className="text-xl">{teacher.name}</CardTitle>
          <CardDescription>Languages Specialist</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">Teaches:</h4>
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
