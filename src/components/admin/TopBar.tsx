"use client";

import React from "react";
import DailyGoalProgress from "./DailyGoalProgress";
import { useDashboard } from "./DashboardProvider";
import { Moon, Sun, Globe } from "lucide-react";
import { Language } from "@/lib/translations";
import NotificationBell from "./NotificationBell";

export default function TopBar({ session, agentDailyGoal, agentConfirmedToday, isAdmin }: any) {
  const { lang, setLang, isDark, setIsDark, t, setIsMobileMenuOpen, isMobileMenuOpen } = useDashboard();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 h-16 flex items-center px-4 sm:px-8 justify-between sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 -ml-2 rtl:-mr-2 rtl:ml-0 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white hidden sm:block">{t("dashboard")}</h1>
        {!isAdmin && agentDailyGoal > 0 && (
          <div className="hidden sm:block">
            <DailyGoalProgress dailyGoal={agentDailyGoal} confirmedToday={agentConfirmedToday} />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Language Switcher */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {(["ar", "fr", "en"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 text-sm font-bold rounded-md transition-all ${
                lang === l 
                  ? "bg-white dark:bg-gray-700 text-primary shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Theme Switcher */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* User Status */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 py-1.5 px-3 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="font-medium">{t("online")}</span>
          <span className="font-bold">{session?.user?.name}</span>
        </div>
      </div>
    </header>
  );
}
