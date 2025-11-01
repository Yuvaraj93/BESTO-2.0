import React, { useState, useEffect, useRef } from 'react';
import { Task, Priority, TaskStatus } from '../../types';
import Modal from '../Modal';

interface TasksViewProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    triggerConfetti: () => void;
    setTaskReminder: (task: Task) => void;
}

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const FlagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
);
const CheckSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
);
const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
);
const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
);

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
    const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
    const [displayDate, setDisplayDate] = useState(initialDate);
    
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); 
    
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    const handleDateSelect = (day: Date) => {
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, '0');
        const date = String(day.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${date}`;
        onChange(formattedDate);
    };
    
    const changeMonth = (delta: number) => {
        setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + delta, 1));
    };

    const handleToday = () => {
        const today = new Date();
        setDisplayDate(today);
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const date = String(today.getDate()).padStart(2, '0');
        onChange(`${year}-${month}-${date}`);
    }
    
    const handleClear = () => {
        onChange('');
    }

    return (
        <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-20 w-80">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800"><ChevronLeftIcon className="w-5 h-5"/></button>
                <span className="font-semibold text-slate-800">{displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800"><ChevronRightIcon className="w-5 h-5"/></button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-slate-500 font-medium mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    if (!day) return <div key={`pad-${index}`}></div>;
                    const dayString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                    const isSelected = value === dayString;
                    const isToday = new Date().toDateString() === day.toDateString();
                    return (
                        <button 
                            key={dayString} 
                            onClick={() => handleDateSelect(day)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm transition-colors ${
                                isSelected ? 'bg-blue-600 text-white font-semibold' : 
                                isToday ? 'bg-blue-100 text-blue-700' : 
                                'hover:bg-slate-100 text-slate-700'
                            }`}
                        >
                            {day.getDate()}
                        </button>
                    )
                })}
            </div>
             <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-200">
                <button onClick={handleClear} className="text-blue-600 hover:text-blue-800 font-semibold text-sm px-2 py-1">Clear</button>
                <button onClick={handleToday} className="text-blue-600 hover:text-blue-800 font-semibold text-sm px-2 py-1">Today</button>
            </div>
        </div>
    );
};


const priorityStyles: { [key in Priority]: string } = {
    none: 'border-slate-300',
    low: 'border-blue-500',
    medium: 'border-yellow-500',
    high: 'border-red-500',
};
const priorityIcons: { [key in Priority]: string } = {
    none: 'text-slate-400',
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
};

const statusConfig: { [key in TaskStatus]: { label: string; color: string } } = {
    'yet-to-start': { label: 'Yet to Start', color: 'bg-slate-200 text-slate-700' },
    'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    'completed': { label: 'Completed', color: 'bg-green-100 text-green-800' },
};

const TaskItem: React.FC<{
    task: Task;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
    onStatusChange: (id: string, status: TaskStatus) => void;
    onSetReminder: (task: Task) => void;
}> = ({ task, onDelete, onEdit, onStatusChange, onSetReminder }) => {
    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
    const statusMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
                setIsStatusMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusChange = (newStatus: TaskStatus) => {
        onStatusChange(task.id, newStatus);
        setIsStatusMenuOpen(false);
    };

    return (
        <div className={`flex items-center bg-white p-3 rounded-lg border-l-4 transition-all duration-200 ${priorityStyles[task.priority]}`}>
            <div className="relative" ref={statusMenuRef}>
                <button
                    onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                    className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${statusConfig[task.status].color}`}
                >
                    {statusConfig[task.status].label}
                </button>
                {isStatusMenuOpen && (
                    <div className="absolute top-full mt-2 bg-white rounded-md shadow-lg border border-slate-200 z-10 w-36">
                        {(Object.keys(statusConfig) as TaskStatus[]).map(status => (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                                {statusConfig[status].label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <span onClick={() => onEdit(task)} className={`ml-3 flex-grow cursor-pointer ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.content}</span>
            {task.priority !== 'none' && <FlagIcon className={`w-4 h-4 mr-2 ${priorityIcons[task.priority]}`} />}
            
            {task.status !== 'completed' && (
                <button onClick={() => onSetReminder(task)} className="text-slate-400 hover:text-blue-500 ml-2" title="Set a reminder in 1 hour">
                    <BellIcon className="w-5 h-5"/>
                </button>
            )}

            <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-slate-400 hover:text-red-500 ml-2">
                <TrashIcon className="w-5 h-5"/>
            </button>
        </div>
    );
};


const TasksView: React.FC<TasksViewProps> = ({ tasks, setTasks, triggerConfetti, setTaskReminder }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskContent, setTaskContent] = useState('');
    const [priority, setPriority] = useState<Priority>('none');
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const resetForm = () => {
        setTaskContent('');
        setPriority('none');
        setDueDate('');
        setDueTime('');
        setEditingTask(null);
    };
    
    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setTaskContent(task.content);
        setPriority(task.priority);
        setDueDate(task.dueDate || '');
        setDueTime(task.dueTime || '');
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handlePriorityChange = (newPriority: Priority) => {
        setPriority(newPriority);
        if (newPriority === 'high') {
            const today = new Date();
            const twoDaysFromNow = new Date(today.setDate(today.getDate() + 2));
            const formattedDate = twoDaysFromNow.toISOString().split('T')[0];
            setDueDate(formattedDate);
        }
    };

    const handleSubmit = () => {
        if (taskContent.trim()) {
            const taskData = {
                content: taskContent,
                priority,
                dueDate: dueDate || undefined,
                dueTime: dueTime || undefined,
            };
            if (editingTask) {
                // Update existing task
                setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
            } else {
                // Add new task
                const newTask: Task = {
                    id: Date.now().toString(),
                    ...taskData,
                    status: 'yet-to-start',
                };
                setTasks(prev => [newTask, ...prev]);
            }
            handleCloseModal();
        }
    };

    const updateTaskStatus = (id: string, status: TaskStatus) => {
        const taskToUpdate = tasks.find(task => task.id === id);
        if (taskToUpdate && taskToUpdate.status !== 'completed' && status === 'completed') {
            triggerConfetti();
        }
        setTasks(tasks.map(task => task.id === id ? { ...task, status } : task));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(task => task.id !== id));
    };
    
    const filteredTasks = tasks.filter(task => task.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const openTasks = filteredTasks.filter(t => t.status !== 'completed');
    const completedTasks = filteredTasks.filter(t => t.status === 'completed');

    const priorityOptions: {label: string, value: Priority, icon?: React.ReactElement}[] = [
        {label: 'None', value: 'none'},
        {label: 'Low', value: 'low', icon: <FlagIcon className="w-4 h-4 text-blue-500" />},
        {label: 'Medium', value: 'medium', icon: <FlagIcon className="w-4 h-4 text-yellow-500" />},
        {label: 'High', value: 'high', icon: <FlagIcon className="w-4 h-4 text-red-500" />},
    ];

    const modalTitle = (
        <div className="flex items-center gap-2">
            <CheckSquareIcon className="w-6 h-6 text-blue-600" />
            <span>{editingTask ? 'Edit Task' : 'Add New Task'}</span>
        </div>
    );
    
    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900">Todos</h2>
                <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                    <PlusIcon className="w-5 h-5"/>
                    <span>Add Task</span>
                </button>
            </div>
            
            <div className="relative mb-4">
                <input 
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
            
            <div className="space-y-3">
                {openTasks.map(task => (
                    <TaskItem key={task.id} task={task} onStatusChange={updateTaskStatus} onDelete={deleteTask} onEdit={openEditModal} onSetReminder={setTaskReminder} />
                ))}
            </div>

            {completedTasks.length > 0 && (
                 <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-500 mb-4">Completed</h3>
                     <div className="space-y-3">
                        {completedTasks.map(task => (
                             <TaskItem key={task.id} task={task} onStatusChange={updateTaskStatus} onDelete={deleteTask} onEdit={openEditModal} onSetReminder={setTaskReminder} />
                        ))}
                    </div>
                </div>
            )}
            
            {tasks.length === 0 && <p className="text-slate-500 text-center mt-8">No tasks yet. Add one to get started!</p>}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalTitle as unknown as string}>
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Task Title</label>
                        <input
                            type="text"
                            value={taskContent}
                            onChange={(e) => setTaskContent(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg border-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Priority</label>
                        <div className="grid grid-cols-2 gap-2">
                            {priorityOptions.map(opt => (
                                <button key={opt.value} onClick={() => handlePriorityChange(opt.value)} 
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-colors font-semibold ${priority === opt.value ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'}`}>
                                    {opt.icon}
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Due Date (Optional)</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="relative" ref={datePickerRef}>
                                <input
                                    readOnly
                                    type="text"
                                    value={formatDateForDisplay(dueDate)}
                                    onClick={() => setIsDatePickerOpen(p => !p)}
                                    placeholder="dd-mm-yyyy"
                                    className="w-full bg-white text-slate-800 pl-3 pr-9 py-2 rounded-lg border-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition cursor-pointer"
                                />
                                <CalendarIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                {isDatePickerOpen && <DatePicker value={dueDate} onChange={(date) => { setDueDate(date); setIsDatePickerOpen(false); }} />}
                            </div>
                            <div className="relative">
                                <input
                                    type="time"
                                    value={dueTime}
                                    onChange={(e) => setDueTime(e.target.value)}
                                    className="w-full bg-white text-slate-800 pl-3 pr-9 py-2 rounded-lg border-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                                />
                                <ClockIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-3 pt-4">
                        <button onClick={handleCloseModal} className="px-5 py-2.5 rounded-lg border-2 border-slate-300 hover:bg-slate-100 transition-colors font-semibold text-slate-700">Cancel</button>
                        <button onClick={handleSubmit} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold">
                            {editingTask ? 'Update Task' : 'Add Task'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TasksView;