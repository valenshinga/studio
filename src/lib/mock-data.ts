
import type { Language, Teacher, ClassEvent, Availability, SimulatedUser, Student } from '@/types';
import { BookOpen, Globe, MessageSquare, Users as UsersIconLucide, Palette, Film, Music } from 'lucide-react'; // Added more icons for variety

export const mockLanguages: Language[] = [
  { id: 'lang_en', name: 'Inglés', icon: Globe, color: 'hsl(var(--chart-1))' },
  { id: 'lang_es', name: 'Español', icon: MessageSquare, color: 'hsl(var(--chart-2))' },
  { id: 'lang_fr', name: 'Francés', icon: UsersIconLucide, color: 'hsl(var(--chart-3))' },
  { id: 'lang_de', name: 'Alemán', icon: BookOpen, color: 'hsl(var(--chart-4))' },
  { id: 'lang_it', name: 'Italiano', icon: Palette, color: 'hsl(var(--chart-5))' },
  { id: 'lang_pt', name: 'Portugués', icon: Film, color: 'hsl(190 60% 50%)' },
  { id: 'lang_jp', name: 'Japonés', icon: Music, color: 'hsl(300 60% 50%)' },
];

export let mockTeachers: Teacher[] = [
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
    languagesTaught: [mockLanguages[0], mockLanguages[3], mockLanguages[4]],
  },
];

export let mockStudents: Student[] = [
  { id: 'student_1', name: 'Bruno Díaz', email: 'bruno.diaz@example.com' },
  { id: 'student_2', name: 'Diana Prince', email: 'diana.prince@example.com' },
  { id: 'student_3', name: 'Clark Kent', email: 'clark.kent@example.com' },
  { id: 'student_4', name: 'Selina Kyle', email: 'selina.kyle@example.com' },
];

export let mockEvents: ClassEvent[] = [
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
    studentIds: [mockStudents[0].id, mockStudents[1].id],
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
    studentIds: [mockStudents[2].id],
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
    studentIds: [mockStudents[0].id, mockStudents[3].id],
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
    studentIds: [mockStudents[1].id, mockStudents[2].id, mockStudents[3].id],
  },
  {
    id: 'event_5',
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    startTime: '16:00',
    endTime: '17:00',
    teacher: mockTeachers[1],
    language: mockLanguages[3], // Corrected, was mockLanguages[3] before as well
    classroom: 'Salón C',
    type: 'special',
    title: 'Jornada de Puertas Abiertas de Alemán',
    description: 'Evento especial para mostrar los cursos de alemán.',
    studentIds: [],
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

// --- Student CRUD ---
export const getStudents = (): Student[] => {
  return [...mockStudents];
};

export const getStudentById = (id: string): Student | undefined => {
  return mockStudents.find(s => s.id === id);
};

export const addStudent = (studentData: Omit<Student, 'id'>): Student => {
  const newStudent: Student = {
    ...studentData,
    id: `student_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
  mockStudents.push(newStudent);
  return newStudent;
};

export const updateStudent = (id: string, studentData: Partial<Omit<Student, 'id'>>): Student | undefined => {
  const studentIndex = mockStudents.findIndex(s => s.id === id);
  if (studentIndex === -1) return undefined;
  mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...studentData };
  return mockStudents[studentIndex];
};

export const deleteStudent = (id: string): boolean => {
  const initialLength = mockStudents.length;
  mockStudents = mockStudents.filter(s => s.id !== id);
  mockEvents.forEach(event => {
    if (event.studentIds) {
      event.studentIds = event.studentIds.filter(studentId => studentId !== id);
    }
  });
  return mockStudents.length < initialLength;
};

// --- Teacher CRUD ---
export const getTeachers = (): Teacher[] => {
  return [...mockTeachers];
};

export const getTeacherById = (id: string): Teacher | undefined => {
  return mockTeachers.find(t => t.id === id);
};

const generateAvatarPlaceholder = (name: string): string => {
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    return `https://placehold.co/80x80.png?text=${initials}`;
}

export const addTeacher = (teacherData: Omit<Teacher, 'id' | 'languagesTaught'> & { languageIds: string[], avatarUrl?: string }): Teacher => {
  const languages = teacherData.languageIds.map(langId => mockLanguages.find(l => l.id === langId)).filter(Boolean) as Language[];
  const newTeacher: Teacher = {
    id: `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: teacherData.name,
    avatarUrl: teacherData.avatarUrl || generateAvatarPlaceholder(teacherData.name),
    languagesTaught: languages,
  };
  mockTeachers.push(newTeacher);
  return newTeacher;
};

export const updateTeacher = (id: string, teacherData: Partial<Omit<Teacher, 'id' | 'languagesTaught'>> & { languageIds?: string[], avatarUrl?: string }): Teacher | undefined => {
  const teacherIndex = mockTeachers.findIndex(t => t.id === id);
  if (teacherIndex === -1) return undefined;

  const currentTeacher = mockTeachers[teacherIndex];
  let newLanguagesTaught = currentTeacher.languagesTaught;
  if (teacherData.languageIds) {
    newLanguagesTaught = teacherData.languageIds.map(langId => mockLanguages.find(l => l.id === langId)).filter(Boolean) as Language[];
  }
  
  const newAvatarUrl = teacherData.avatarUrl === "" ? generateAvatarPlaceholder(teacherData.name || currentTeacher.name) : teacherData.avatarUrl || currentTeacher.avatarUrl;


  mockTeachers[teacherIndex] = {
    ...currentTeacher,
    ...teacherData,
    avatarUrl: newAvatarUrl,
    languagesTaught: newLanguagesTaught,
  };
  return mockTeachers[teacherIndex];
};

export const deleteTeacher = (id: string): boolean => {
  // Check if teacher is assigned to any class
  const isTeacherInClass = mockEvents.some(event => event.teacher.id === id);
  if (isTeacherInClass) {
    return false; // Cannot delete teacher if they have classes
  }

  const initialLength = mockTeachers.length;
  mockTeachers = mockTeachers.filter(t => t.id !== id);
  // Also remove unavailabilities for this teacher
  mockUnavailabilities = mockUnavailabilities.filter(ua => ua.teacherId !== id);
  return mockTeachers.length < initialLength;
};


// --- Availability ---
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
  id: mockTeachers.length > 0 ? mockTeachers[0].id : 'teacher_fallback',
  name: mockTeachers.length > 0 ? mockTeachers[0].name : 'Profesor Ejemplo',
  role: 'teacher',
};

// Ensure simulatedUser is updated if the first teacher changes
if (mockTeachers.length > 0 && simulatedUser.id !== mockTeachers[0].id) {
    simulatedUser.id = mockTeachers[0].id;
    simulatedUser.name = mockTeachers[0].name;
} else if (mockTeachers.length === 0 && simulatedUser.id !== 'teacher_fallback') {
    simulatedUser.id = 'teacher_fallback';
    simulatedUser.name = 'Profesor Ejemplo';
}
