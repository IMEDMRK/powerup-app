"use client";

import React from "react";
import { Calendar } from "lucide-react";

export default function MonthFilter({ selectedMonthStr, monthOptions }: { 
  selectedMonthStr: string, 
  monthOptions: { value: string, label: string }[] 
}) {
  return (
    <form className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
      <Calendar size={18} className="text-primary" />
      <select 
        name="month" 
        defaultValue={selectedMonthStr} 
        onChange={(e) => {
          e.target.form?.submit();
        }}
        className="bg-transparent text-sm font-bold text-gray-800 outline-none cursor-pointer"
      >
        {monthOptions.map(m => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </form>
  );
}
