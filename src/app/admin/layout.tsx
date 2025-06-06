"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Settings, Users, Brain, Play, Database, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  {
    title: "Experiments",
    href: "/admin",
    icon: Play,
  },
  {
    title: "Personas",
    href: "/admin/personas",
    icon: Brain,
  },
  {
    title: "Conditions",
    href: "/admin/conditions",
    icon: Settings,
  },
  {
    title: "Sessions",
    href: "/admin/sessions",
    icon: Database,
  },
  {
    title: "Participants",
    href: "/admin/participants",
    icon: Users,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Psychology Lab Admin
          </h2>
        </div>
        
        <nav className="px-4 space-y-1 flex-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isActive && "bg-secondary/80"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <Link href="/">
            <Button variant="default" size="sm" className="w-full gap-2">
              <MessageCircle className="h-4 w-4" />
              Back to Chat
            </Button>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
} 