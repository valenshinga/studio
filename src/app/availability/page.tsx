
"use client";

import { AvailabilityForm } from '@/components/availability-form';
import { UserCog } from 'lucide-react';

export default function AvailabilityPage() {
  return (
    <div className="container mx-auto py-8">
       <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4">
           <UserCog className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Gestionar Disponibilidad</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Actualiza tu horario para asegurar una planificación precisa de las clases.
        </p>
      </div>
      <AvailabilityForm />
    </div>
  );
}
