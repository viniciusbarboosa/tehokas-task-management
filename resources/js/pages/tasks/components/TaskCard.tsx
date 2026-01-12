import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Calendar, Pencil } from 'lucide-react';
import { type Task } from '@/types';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    isDragging?: boolean;
}

export default function TaskCard({ task, onEdit, onDelete, isDragging }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isActuallyDragging,
    } = useSortable({ 
        id: task.id.toString(),
        data: {
            type: 'task',
            task
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isActuallyDragging ? 0.5 : 1,
    };

    const getPriorityColor = () => {
        const today = new Date();
        const deadline = new Date(task.deadline);
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
        if (diffDays <= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    };

    if (isDragging) {
        return (
            <div className="rotate-2 opacity-90 cursor-grabbing w-full">
                 <div className="rounded-lg border border-sidebar-border bg-white p-4 shadow-xl dark:bg-gray-800">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
                 </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="touch-none group relative"
        >
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800 transition-shadow">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                            {task.title}
                        </h4>
                        {task.description && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                {task.description}
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {task.deadline && (
                            <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${getPriorityColor()}`}>
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(task.deadline).toLocaleDateString('pt-BR')}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
                            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                            onPointerDown={(e) => e.stopPropagation()} 
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}