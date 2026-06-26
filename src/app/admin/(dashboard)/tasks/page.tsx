import KanbanBoard from "@/components/admin/KanbanBoard";

export const metadata = {
  title: "لوحة المهام | Power Up",
};

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">لوحة المهام (Kanban)</h1>
          <p className="text-gray-500 mt-1">إدارة مهام الفريق وتتبع الإنجاز عبر السحب والإفلات</p>
        </div>
      </div>
      
      <KanbanBoard />
    </div>
  );
}
