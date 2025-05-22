
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStudentById, mockEvents, mockTeachers, mockLanguages } from '@/lib/mock-data'; // Assuming mockEvents is exported
import type { Student, ClassEvent, Teacher, Language } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, BookOpen, CalendarDays, Clock, Users, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<Student | null | undefined>(undefined); // undefined for loading, null for not found
  const [enrolledClasses, setEnrolledClasses] = useState<ClassEvent[]>([]);

  useEffect(() => {
    if (studentId) {
      const foundStudent = getStudentById(studentId);
      setStudent(foundStudent);

      if (foundStudent) {
        const classes = mockEvents.filter(event => event.studentIds?.includes(foundStudent.id) && event.type === 'class');
        setEnrolledClasses(classes.sort((a,b) => b.date.getTime() - a.date.getTime())); // Sort by date, newest first
      }
    }
  }, [studentId]);

  if (student === undefined) {
    return (
      <div className="container mx-auto py-8 text-center">
        <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Cargando detalles del alumno...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto py-8 text-center">
        <GraduationCap className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Alumno no encontrado</h1>
        <p className="text-muted-foreground mb-4">No se pudo encontrar al alumno con el ID proporcionado.</p>
        <Button onClick={() => router.push('/students')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista de Alumnos
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <User className="h-10 w-10" />
              </div>
              <div>
                <CardTitle className="text-3xl">{student.name}</CardTitle>
                <CardDescription className="text-lg">{student.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <GraduationCap className="mr-3 h-7 w-7 text-primary" />
            Clases Inscritas ({enrolledClasses.length})
          </CardTitle>
          <CardDescription>
            Historial y clases actuales a las que el alumno está o ha estado inscrito.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrolledClasses.length > 0 ? (
            <ul className="space-y-6">
              {enrolledClasses.map((classEvent) => {
                const LanguageIcon = classEvent.language.icon || BookOpen;
                return (
                  <li key={classEvent.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold text-primary mb-1">{classEvent.title || `${classEvent.language.name} con ${classEvent.teacher.name}`}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center"><User className="mr-2 h-4 w-4" /> Profesor(a): {classEvent.teacher.name}</p>
                      <p className="flex items-center">
                        <LanguageIcon className="mr-2 h-4 w-4" style={{ color: classEvent.language.color }} />
                        Idioma: {classEvent.language.name}
                      </p>
                      <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4" /> Fecha: {format(classEvent.date, 'PPP', { locale: es })}</p>
                      <p className="flex items-center"><Clock className="mr-2 h-4 w-4" /> Horario: {classEvent.startTime} - {classEvent.endTime}</p>
                      <p className="flex items-center col-span-full md:col-span-1"><Users className="mr-2 h-4 w-4" /> Salón: {classEvent.classroom}</p>
                    </div>
                    {classEvent.description && <p className="text-xs mt-2 text-gray-500">{classEvent.description}</p>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-10">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Este alumno no está inscrito en ninguna clase actualmente.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

