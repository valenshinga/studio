
"use client";

import { TeacherCard } from '@/components/teacher-card';
import { getTeachersService } from '@/lib/data-service';
import type { Teacher } from '@/types';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTeachers() {
      setIsLoading(true);
      try {
        const teachersData = await getTeachersService();
        setAllTeachers(teachersData);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
        // Optionally set an error state
      } finally {
        setIsLoading(false);
      }
    }
    fetchTeachers();
  }, []);

  const filteredTeachers = allTeachers.filter(teacher =>
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTeachers.length > 0 ? (
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

function CardSkeleton() {
  return (
    <div className="p-4 border rounded-lg shadow-md">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-20 mb-2" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}
