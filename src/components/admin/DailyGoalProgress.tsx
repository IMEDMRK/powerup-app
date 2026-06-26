"use client";

import React from "react";
import { Target, Flame, Trophy } from "lucide-react";

interface DailyGoalProgressProps {
  dailyGoal: number;
  confirmedToday: number;
}

export default function DailyGoalProgress({ dailyGoal, confirmedToday }: DailyGoalProgressProps) {
  if (dailyGoal <= 0) return null;

  const percentage = Math.min(100, Math.round((confirmedToday / dailyGoal) * 100));
  const isCompleted = confirmedToday >= dailyGoal;
  
  let barColor = "bg-blue-500";
  let textColor = "text-blue-600";
  let Icon = Target;
  
  if (isCompleted) {
    barColor = "bg-green-500 animate-pulse";
    textColor = "text-green-600";
    Icon = Trophy;
  } else if (percentage >= 80) {
    barColor = "bg-orange-500";
    textColor = "text-orange-600";
    Icon = Flame;
  }

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-2" title="الهدف اليومي لتأكيد الطلبيات">
      <div className={`p-1.5 rounded-lg ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
        <Icon size={18} className={isCompleted ? "animate-bounce" : ""} />
      </div>
      
      <div className="w-48">
        <div className="flex justify-between items-center mb-1 text-xs font-bold">
          <span className="text-gray-500">الهدف اليومي</span>
          <span className={textColor}>
            {confirmedToday} / {dailyGoal}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ease-out ${barColor}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      
      {isCompleted && (
        <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">
          أحسنت! 🎉
        </span>
      )}
    </div>
  );
}
