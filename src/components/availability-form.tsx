"use client";

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addUnavailability, removeUnavailability, getUnavailabilitiesForTeacher, simulatedUser, mockTeachers } from '@/lib/mock-data';
import type { Availability, SimulatedUser } from '@/types';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AvailabilityForm() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [reason, setReason] = useState('');
  const [currentUser, setCurrentUser] = useState<SimulatedUser>(simulatedUser);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const { toast } = useToast();

  const loadUnavailabilities = (teacherId: string) => {
    const dates = getUnavailabilitiesForTeacher(teacherId).map(ua => ua.date);
    setUnavailableDates(dates);
  };
  
  useEffect(() => {
    loadUnavailabilities(currentUser.id);
  }, [currentUser.id]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const existingUnavailability = getUnavailabilitiesForTeacher(currentUser.id).find(
        ua => ua.date.toDateString() === date.toDateString()
      );
      setReason(existingUnavailability?.reason || '');
    } else {
      setReason('');
    }
  };

  const handleSetAvailability = (available: boolean) => {
    if (!selectedDate) {
      toast({ title: "No date selected", description: "Please select a date first.", variant: "destructive" });
      return;
    }

    if (!available) { // Setting as unavailable
      addUnavailability({ teacherId: currentUser.id, date: selectedDate, isUnavailable: true, reason });
      toast({ title: "Date marked as unavailable", description: `${format(selectedDate, 'PPP')} is now unavailable.`, variant: "default" });
    } else { // Setting as available
      removeUnavailability(selectedDate, currentUser.id);
      toast({ title: "Date marked as available", description: `${format(selectedDate, 'PPP')} is now available.`, variant: "default" });
    }
    loadUnavailabilities(currentUser.id); // Refresh the list
    setReason(''); // Reset reason after submission
  };

  const isSelectedDateUnavailable = selectedDate && unavailableDates.some(d => d.toDateString() === selectedDate.toDateString());

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>Manage Your Availability</CardTitle>
        <CardDescription>
          Select a teacher and dates to mark them as unavailable. These will reflect on the main calendar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="teacher-select">Select Teacher</Label>
          <Select
            value={currentUser.id}
            onValueChange={(teacherId) => {
              const teacher = mockTeachers.find(t => t.id === teacherId);
              if (teacher) {
                setCurrentUser({ id: teacher.id, name: teacher.name, role: 'teacher' });
              }
            }}
          >
            <SelectTrigger id="teacher-select">
              <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
              {mockTeachers.map(teacher => (
                <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">Currently managing availability for: {currentUser.name}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border self-center md:self-start"
            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Disable past dates
            modifiers={{ unavailable: unavailableDates }}
            modifiersStyles={{
              unavailable: { backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))', opacity: 0.8 },
              selected: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
            }}
          />
          <div className="flex-1 space-y-4 w-full">
            {selectedDate && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Selected Date: {format(selectedDate, "PPP")}
                </h3>
                {isSelectedDateUnavailable && (
                  <div className="flex items-center text-accent mb-2 p-2 rounded-md bg-accent/10">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>This date is currently marked as unavailable.</span>
                  </div>
                )}
                 {!isSelectedDateUnavailable && (
                  <div className="flex items-center text-green-600 mb-2 p-2 rounded-md bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    <span>This date is currently marked as available.</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for unavailability (optional)</Label>
                  <Textarea 
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Doctor's appointment" 
                    disabled={isSelectedDateUnavailable}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleSetAvailability(false)} disabled={isSelectedDateUnavailable} className="w-full">
                    Mark as Unavailable
                  </Button>
                  <Button onClick={() => handleSetAvailability(true)} variant="outline" disabled={!isSelectedDateUnavailable} className="w-full">
                    Mark as Available
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
