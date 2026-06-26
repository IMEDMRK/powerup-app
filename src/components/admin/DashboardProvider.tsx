"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, getTranslation } from "@/lib/translations";

interface DashboardContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  t: (key: any) => string;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("ar");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedLang = localStorage.getItem("dashboard_lang") as Language;
    if (savedLang) setLang(savedLang);

    const savedDark = localStorage.getItem("dashboard_dark");
    if (savedDark === "true") setIsDark(true);

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("dashboard_lang", lang);
  }, [lang, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("dashboard_dark", isDark.toString());
  }, [isDark, mounted]);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center opacity-0 transition-opacity">جاري التحميل...</div>;
  }

  return (
    <DashboardContext.Provider value={{ lang, setLang, isDark, setIsDark, t }}>
      <div 
        className={`${isDark ? "dark" : ""} min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200`}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {children}
      </div>
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
}
