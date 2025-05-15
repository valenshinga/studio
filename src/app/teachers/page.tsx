"use client";

import { TeacherCard } from '@/components/teacher-card';
import { mockTeachers } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { useState } from 'react'; // Import useState
import { Users } from 'lucide-react';

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = mockTeachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.languagesTaught.some(lang => lang.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4">
           <Users className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Our Talented Teachers</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Meet the dedicated professionals who make language learning an engaging experience.
        </p>
      </div>
      
      <div className="mb-8 max-w-md mx-auto">
        <Input
          type="text"
          placeholder="Search teachers or languages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-base"
        />
      </div>

      {filteredTeachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map(teacher => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-10 text-lg">
          No teachers found matching your search criteria.
        </p>
      )}
    </div>
  );
}
