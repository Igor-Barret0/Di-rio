"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        onToggleTheme={toggleTheme}
        themeLabel={mounted && theme === "dark" ? "dark" : "light"}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar}
        />
        <main 
          className={cn(
            "flex-1 overflow-y-auto px-4 md:px-12 transition-all duration-500 ease-in-out pt-24",
          )}
        >
          <div className="container mx-auto max-w-7xl pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
