"use client";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] w-full">
      <div className="relative flex justify-center items-center w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <h3 className="mt-6 text-xl font-bold text-gray-700 animate-pulse">جاري التحميل...</h3>
      <p className="text-gray-400 mt-2 text-sm">لحظات ونقوم بإحضار البيانات</p>
    </div>
  );
}
