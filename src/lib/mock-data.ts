import type { Language, Teacher, ClassEvent, Availability, SimulatedUser } from '@/types';
import { BookOpen, Globe, MessageSquare, Users } from 'lucide-react';

export const mockLanguages: Language[] = [
  { id: 'lang_en', name: 'Inglés', icon: Globe, color: 'hsl(var(--chart-1))' },
  { id: 'lang_es', name: 'Español', icon: MessageSquare, color: 'hsl(var(--chart-2))' },
  { id: 'lang_fr', name: 'Francés', icon: Users, color: 'hsl(var(--chart-3))' },
  { id: 'lang_de', name: 'Alemán', icon: BookOpen, color: 'hsl(var(--chart-4))' },
];

export const mockTeachers: Teacher[] = [
  {
    id: 'teacher_1',
    name: 'Alicia Wonderland',
    avatarUrl: 'https://placehold.co/100x100.png?text=AW',
    languagesTaught: [mockLanguages[0], mockLanguages[1]],
  },
  {
    id: 'teacher_2',
    name: 'Roberto Constructor',
    avatarUrl: 'https://placehold.co/100x100.png?text=RC',
    languagesTaught: [mockLanguages[2], mockLanguages[3]],
  },
  {
    id: 'teacher_3',
    name: 'Carlos Chaplin',
    avatarUrl: 'https://placehold.co/100x100.png?text=CC',
    languagesTaught: [mockLanguages[0], mockLanguages[3]],
  },
];

export const mockEvents: ClassEvent[] = [
  {
    id: 'event_1',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    startTime: '09:00',
    endTime: '10:30',
    teacher: mockTeachers[0],
    language: mockLanguages[0],
    classroom: 'Salón A',
    type: 'class',
    title: 'Inglés Principiante con Alicia',
  },
  {
    id: 'event_2',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    startTime: '11:00',
    endTime: '12:30',
    teacher: mockTeachers[1],
    language: mockLanguages[2],
    classroom: 'Salón B',
    type: 'class',
    title: 'Francés Intermedio con Roberto',
  },
  {
    id: 'event_3',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    startTime: '14:00',
    endTime: '15:30',
    teacher: mockTeachers[0],
    language: mockLanguages[1],
    classroom: 'Salón A',
    type: 'class',
    title: 'Español Avanzado con Alicia',
  },
  {
    id: 'event_4',
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    startTime: '10:00',
    endTime: '11:30',
    teacher: mockTeachers[2],
    language: mockLanguages[3],
    classroom: 'En línea',
    type: 'class',
    title: 'Conversación en Alemán con Carlos',
  },
  {
    id: 'event_5', 
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    startTime: '16:00',
    endTime: '17:00',
    teacher: mockTeachers[1],
    language: mockLanguages[3],
    classroom: 'Salón C',
    type: 'special',
    title: 'Jornada de Puertas Abiertas de Alemán',
    description: 'Evento especial para mostrar los cursos de alemán.'
  },
];

export let mockUnavailabilities: Availability[] = [
  {
    id: 'unavail_1',
    teacherId: mockTeachers[0].id,
    date: new Date(new Date().setDate(new Date().getDate() + 4)),
    isUnavailable: true,
    reason: 'Cita Personal',
  },
  {
    id: 'unavail_2', 
    teacherId: mockTeachers[2].id,
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    isUnavailable: true,
    reason: 'Conferencia',
  }
];

export const addUnavailability = (availability: Omit<Availability, 'id'>): Availability => {
  const newEntry = { ...availability, id: `unavail_${Date.now()}` };
  mockUnavailabilities.push(newEntry);
  return newEntry;
};

export const removeUnavailability = (date: Date, teacherId: string): void => {
  mockUnavailabilities = mockUnavailabilities.filter(
    (ua) => !(ua.teacherId === teacherId && ua.date.toDateString() === date.toDateString())
  );
};

export const getUnavailabilitiesForTeacher = (teacherId: string): Availability[] => {
  return mockUnavailabilities.filter(ua => ua.teacherId === teacherId && ua.isUnavailable);
};

export const getUnavailabilityForDate = (date: Date, teacherId: string): Availability | undefined => {
  return mockUnavailabilities.find(
    (ua) => ua.teacherId === teacherId && ua.date.toDateString() === date.toDateString() && ua.isUnavailable
  );
};

export const simulatedUser: SimulatedUser = {
  id: mockTeachers[0].id, // Alicia Wonderland
  name: mockTeachers[0].name,
  role: 'teacher',
};
