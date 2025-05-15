import type { Language, Teacher, ClassEvent, Availability, SimulatedUser } from '@/types';
import { BookOpen, Globe, MessageSquare, Users } from 'lucide-react';

export const mockLanguages: Language[] = [
  { id: 'lang_en', name: 'English', icon: Globe, color: 'hsl(var(--chart-1))' },
  { id: 'lang_es', name: 'Spanish', icon: MessageSquare, color: 'hsl(var(--chart-2))' },
  { id: 'lang_fr', name: 'French', icon: Users, color: 'hsl(var(--chart-3))' },
  { id: 'lang_de', name: 'German', icon: BookOpen, color: 'hsl(var(--chart-4))' },
];

export const mockTeachers: Teacher[] = [
  {
    id: 'teacher_1',
    name: 'Alice Wonderland',
    avatarUrl: 'https://placehold.co/100x100.png?text=AW',
    languagesTaught: [mockLanguages[0], mockLanguages[1]],
  },
  {
    id: 'teacher_2',
    name: 'Bob The Builder',
    avatarUrl: 'https://placehold.co/100x100.png?text=BB',
    languagesTaught: [mockLanguages[2], mockLanguages[3]],
  },
  {
    id: 'teacher_3',
    name: 'Charlie Chaplin',
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
    classroom: 'Room A',
    type: 'class',
    title: 'Beginner English with Alice',
  },
  {
    id: 'event_2',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    startTime: '11:00',
    endTime: '12:30',
    teacher: mockTeachers[1],
    language: mockLanguages[2],
    classroom: 'Room B',
    type: 'class',
    title: 'Intermediate French with Bob',
  },
  {
    id: 'event_3',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    startTime: '14:00',
    endTime: '15:30',
    teacher: mockTeachers[0],
    language: mockLanguages[1],
    classroom: 'Room A',
    type: 'class',
    title: 'Advanced Spanish with Alice',
  },
  {
    id: 'event_4',
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    startTime: '10:00',
    endTime: '11:30',
    teacher: mockTeachers[2],
    language: mockLanguages[3],
    classroom: 'Online',
    type: 'class',
    title: 'German Conversation with Charlie',
  },
  {
    id: 'event_5', // Example of a special event using accent color
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    startTime: '16:00',
    endTime: '17:00',
    teacher: mockTeachers[1],
    language: mockLanguages[3],
    classroom: 'Room C',
    type: 'special',
    title: 'German Open House',
    description: 'Special event to showcase German courses.'
  },
];

// Mutable store for unavailabilities for demo purposes
export let mockUnavailabilities: Availability[] = [
  {
    id: 'unavail_1',
    teacherId: mockTeachers[0].id,
    date: new Date(new Date().setDate(new Date().getDate() + 4)),
    isUnavailable: true,
    reason: 'Personal Appointment',
  },
  {
    id: 'unavail_2', // This will conflict with event_4 if teacher_2 teaches it
    teacherId: mockTeachers[2].id,
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    isUnavailable: true,
    reason: 'Conference',
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

// Simulate a logged-in user (teacher)
export const simulatedUser: SimulatedUser = {
  id: mockTeachers[0].id, // Alice Wonderland
  name: mockTeachers[0].name,
  role: 'teacher',
};
