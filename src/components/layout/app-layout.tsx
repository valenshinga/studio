
"use client";

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset, // Or use a simple div for main content area
} from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { LinguaCalLogo } from '@/components/icons/logo';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
          <SidebarHeader className="p-4 flex items-center justify-between">
            <LinguaCalLogo />
            <SidebarTrigger className="hidden md:flex" />
          </SidebarHeader>
          <Separator />
          <SidebarContent className="p-2">
            <SidebarNav />
          </SidebarContent>
          <Separator />
          <SidebarFooter className="p-4">
            {/* Placeholder for user profile or logout */}
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        {/* Main content area */}
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-md md:h-[60px]">
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {/* Placeholder for potential header actions like notifications or user menu */}
                </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
