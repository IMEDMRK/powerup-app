"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, GripVertical, Trash2, Calendar, CheckSquare, Square, Check } from "lucide-react";

type SubTask = { id: string; title: string; isDone: boolean };

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  assignee: string | null;
  deadline: string | null;
  subTasks: SubTask[];
  order: number;
};

const COLUMNS = [
  { id: "NEW", title: "جديدة", bgColor: "bg-blue-50 dark:bg-blue-900/20", borderColor: "border-blue-200 dark:border-blue-800", headerColor: "text-blue-600 dark:text-blue-400", cardBg: "bg-blue-100/50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800/50" },
  { id: "IN_PROGRESS", title: "قيد الإنجاز", bgColor: "bg-orange-50 dark:bg-orange-900/20", borderColor: "border-orange-200 dark:border-orange-800", headerColor: "text-orange-600 dark:text-orange-400", cardBg: "bg-orange-100/50 hover:bg-orange-100 dark:bg-orange-900/10 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-800/50" },
  { id: "DONE", title: "منجزة", bgColor: "bg-green-50 dark:bg-green-900/20", borderColor: "border-green-200 dark:border-green-800", headerColor: "text-green-600 dark:text-green-400", cardBg: "bg-green-100/50 hover:bg-green-100 dark:bg-green-900/10 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800/50" },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [isBrowser, setIsBrowser] = useState(false);
  const [newSubTaskTitles, setNewSubTaskTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsBrowser(true);
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/admin/tasks");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Ensure subTasks is always an array
        const processed = data.map(t => ({
          ...t,
          subTasks: Array.isArray(t.subTasks) ? t.subTasks : []
        }));
        setTasks(processed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await fetch(`/api/admin/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    const sourceTasks = tasks.filter(t => t.status === sourceStatus).sort((a, b) => a.order - b.order);
    const destTasks = sourceStatus === destStatus ? sourceTasks : tasks.filter(t => t.status === destStatus).sort((a, b) => a.order - b.order);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    movedTask.status = destStatus;
    
    destTasks.splice(destination.index, 0, movedTask);

    const updatedDestTasks = destTasks.map((t, index) => ({ ...t, order: index * 1000 }));
    
    let newAllTasks = tasks.filter(t => t.status !== sourceStatus && t.status !== destStatus);
    if (sourceStatus === destStatus) {
        newAllTasks = [...newAllTasks, ...updatedDestTasks];
    } else {
        const updatedSourceTasks = sourceTasks.map((t, index) => ({ ...t, order: index * 1000 }));
        newAllTasks = [...newAllTasks, ...updatedSourceTasks, ...updatedDestTasks];
    }

    setTasks(newAllTasks);

    await updateTask(movedTask.id, {
      status: destStatus,
      order: updatedDestTasks.find(t => t.id === movedTask.id)?.order || 0
    });
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          assignee: newTaskAssignee || null,
          deadline: newTaskDeadline || null,
          status: "NEW"
        })
      });

      if (res.ok) {
        const created = await res.json();
        created.subTasks = [];
        setTasks([...tasks, created]);
        setNewTaskTitle("");
        setNewTaskAssignee("");
        setNewTaskDeadline("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;
    try {
      await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSubTask = async (taskId: string, subTaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubTasks = task.subTasks.map(st => 
      st.id === subTaskId ? { ...st, isDone: !st.isDone } : st
    );

    const newTasks = tasks.map(t => t.id === taskId ? { ...t, subTasks: updatedSubTasks } : t);
    setTasks(newTasks);

    await updateTask(taskId, { subTasks: updatedSubTasks });
  };

  const addSubTask = async (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    const stTitle = newSubTaskTitles[taskId]?.trim();
    if (!stTitle) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubTask = { id: Date.now().toString(), title: stTitle, isDone: false };
    const updatedSubTasks = [...task.subTasks, newSubTask];

    const newTasks = tasks.map(t => t.id === taskId ? { ...t, subTasks: updatedSubTasks } : t);
    setTasks(newTasks);
    setNewSubTaskTitles({ ...newSubTaskTitles, [taskId]: "" });

    await updateTask(taskId, { subTasks: updatedSubTasks });
  };

  const deleteSubTask = async (taskId: string, subTaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubTasks = task.subTasks.filter(st => st.id !== subTaskId);

    const newTasks = tasks.map(t => t.id === taskId ? { ...t, subTasks: updatedSubTasks } : t);
    setTasks(newTasks);

    await updateTask(taskId, { subTasks: updatedSubTasks });
  }

  const isOverdue = (deadline: string | null, status: string) => {
    if (!deadline || status === "DONE") return false;
    const date = new Date(deadline);
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today;
  };

  if (!isBrowser) return null;
  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">جاري تحميل المهام...</div>;

  return (
    <div>
      {/* Add Task Form */}
      <form onSubmit={addTask} className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 mb-2 px-1">اسم المهمة (الرئيسية)</label>
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
            placeholder="مثال: مونتاج فيديو المنتج الجديد..."
            required
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-gray-500 mb-2 px-1">المسؤول (اختياري)</label>
          <input 
            type="text" 
            value={newTaskAssignee}
            onChange={(e) => setNewTaskAssignee(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
            placeholder="مثال: Video Editor / Media Buyer"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-gray-500 mb-2 px-1">تاريخ الانتهاء (Deadline)</label>
          <input 
            type="date" 
            value={newTaskDeadline}
            onChange={(e) => setNewTaskDeadline(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
          />
        </div>
        <button type="submit" className="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors h-[46px] shadow-sm shadow-primary/30">
          <Plus size={18} />
          إضافة
        </button>
      </form>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(col => {
            const columnTasks = tasks.filter(t => t.status === col.id).sort((a, b) => a.order - b.order);

            return (
              <div key={col.id} className={`${col.bgColor} ${col.borderColor} border rounded-3xl p-4 flex flex-col h-full min-h-[500px]`}>
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className={`font-black text-lg ${col.headerColor}`}>{col.title}</h3>
                  <span className="bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {columnTasks.length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex-1 flex flex-col gap-4 min-h-[100px]"
                    >
                      {columnTasks.map((task, index) => {
                        const overdue = isOverdue(task.deadline, task.status);
                        const progress = task.subTasks.length > 0 
                            ? Math.round((task.subTasks.filter(st => st.isDone).length / task.subTasks.length) * 100) 
                            : 0;

                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`${col.cardBg} rounded-2xl p-4 shadow-sm border transition-all ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary scale-105 opacity-95 z-50' : ''}`}
                              >
                                <div className="flex items-start gap-2">
                                  <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab mt-1 shrink-0">
                                    <GripVertical size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-[15px] break-words">{task.title}</h4>
                                    
                                    {/* Assignee & Deadline */}
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                      {task.assignee && (
                                        <div className="inline-flex items-center bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 text-[11px] font-bold px-2 py-1 rounded-md shadow-sm border border-white/40">
                                          👤 {task.assignee}
                                        </div>
                                      )}
                                      {task.deadline && (
                                        <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md shadow-sm border border-white/40 ${overdue ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300'}`}>
                                          <Calendar size={12} />
                                          {new Date(task.deadline).toLocaleDateString('en-GB')}
                                        </div>
                                      )}
                                    </div>

                                    {/* Subtasks Progress */}
                                    {task.subTasks.length > 0 && (
                                      <div className="mt-4">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 mb-1 px-1">
                                          <span>المهام الفرعية ({task.subTasks.filter(st => st.isDone).length}/{task.subTasks.length})</span>
                                          <span>{progress}%</span>
                                        </div>
                                        <div className="w-full bg-white/50 dark:bg-gray-800/50 rounded-full h-1.5 overflow-hidden">
                                          <div className={`h-1.5 rounded-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${progress}%` }}></div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Subtasks Checklist */}
                                    <div className="mt-3 space-y-1.5">
                                      {task.subTasks.map(st => (
                                        <div key={st.id} className="flex items-start gap-2 group/st relative">
                                          <button 
                                            onClick={() => toggleSubTask(task.id, st.id)}
                                            className={`mt-0.5 shrink-0 w-4 h-4 rounded-sm flex items-center justify-center border transition-colors ${st.isDone ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-400 text-transparent hover:border-gray-500 shadow-sm'}`}
                                          >
                                            <Check size={12} strokeWidth={3} />
                                          </button>
                                          <span className={`text-xs flex-1 ${st.isDone ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200 font-medium'}`}>
                                            {st.title}
                                          </span>
                                          <button 
                                            onClick={() => deleteSubTask(task.id, st.id)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover/st:opacity-100 transition-opacity p-0.5 absolute left-0"
                                            title="حذف"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Add Subtask Form */}
                                    <form onSubmit={(e) => addSubTask(e, task.id)} className="mt-3 flex items-center gap-2">
                                      <input 
                                        type="text" 
                                        value={newSubTaskTitles[task.id] || ""}
                                        onChange={(e) => setNewSubTaskTitles({...newSubTaskTitles, [task.id]: e.target.value})}
                                        className="flex-1 bg-white/60 dark:bg-gray-800/60 border border-transparent hover:border-gray-300 focus:border-primary focus:bg-white rounded-lg px-2 py-1.5 text-xs font-medium outline-none transition-all placeholder:text-gray-400 shadow-sm"
                                        placeholder="+ إضافة مهمة فرعية..."
                                      />
                                    </form>

                                  </div>
                                  <button 
                                    onClick={() => deleteTask(task.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 shrink-0 bg-white/50 rounded-lg hover:bg-white"
                                    title="حذف المهمة الرئيسية"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
