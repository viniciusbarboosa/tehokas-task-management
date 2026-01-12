import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TaskCard from './TaskCard';
import { type Task } from '@/types';

interface KanbanColumnProps {
    id: string;
    title: string;
    color: string;
    count: number;
    tasks: Task[];
    onEditTask: (task: Task) => void;
    onDeleteTask: (task: Task) => void;
    onViewTask?: (task: Task) => void;
}

export default function KanbanColumn({
    id,
    title,
    color,
    count,
    tasks,
    onEditTask,
    onDeleteTask,
    onViewTask
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,//ID DA COLUNA DE DESTINO
    });

    const getStatusColor = () => {
        switch (id) {
            case 'pendente': return 'bg-red-500';
            case 'em_andamento': return 'bg-yellow-500';
            case 'concluida': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        //IMPORTANTE AQUI pra controlar o tamanho da coluna na tela
        <Card className={`flex flex-col h-full max-h-[calc(100vh-15rem)] ${isOver ? 'ring-2 ring-[#3D5B69] ring-offset-2' : ''} ${color} border-0`}>
            
            <CardHeader className="pb-3 flex-none">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${getStatusColor()}`} />
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {title}
                        </CardTitle>
                        <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-gray-700 shadow-sm dark:bg-gray-700 dark:text-gray-200">
                            {count}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto min-h-[150px] p-2" ref={setNodeRef}>
                <div className="flex flex-col gap-2 pb-4">
                    <SortableContext
                        items={tasks.map(task => task.id.toString())}
                        strategy={verticalListSortingStrategy}
                    >
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={onEditTask}
                                onDelete={onDeleteTask}
                                onViewDetails={onViewTask}
                            />
                        ))}
                    </SortableContext>

                    {tasks.length === 0 && (
                        <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-400/20 dark:border-gray-600/20">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Arraste tarefas aqui
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}