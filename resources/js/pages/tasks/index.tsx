import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import AppLayout from '@/layouts/app-layout';
import KanbanColumn from './components/KanbanColumn';
import TaskCard from './components/TaskCard';
import TaskFormDialog from './components/TaskFormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trello, AlertCircle, Users, Folder } from 'lucide-react';
import { type Task, type Project, type BreadcrumbItem } from '@/types';

interface TasksPageProps {
    project: Project;
    tasks: {
        pendente: Task[];
        em_andamento: Task[];
        concluida: Task[];
    };
    stats: {
        total: number;
        pendente: number;
        em_andamento: number;
        concluida: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tarefas', href: '/tarefas' },
];

export default function TasksIndex({ project, tasks, stats }: TasksPageProps) {
    if (!project) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Tarefas" />
                <div className="flex flex-1 flex-col gap-6 p-6">
                    <div className="text-center py-12">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#3D5B69]/10">
                            <Folder className="h-8 w-8 text-[#3D5B69]" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Nenhum Projeto Ativo
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Selecione um projeto ativo para visualizar as tarefas.
                        </p>
                        <Button
                            onClick={() => router.get('/projetos')}
                            className="mt-4 bg-[#3D5B69] hover:bg-[#2c424b]"
                        >
                            <Folder className="mr-2 h-4 w-4" />
                            Selecionar Projeto
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const columnConfigs = [
        {
            id: 'pendente',
            title: 'Pendente',
            color: 'border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-900/10',
            count: stats.pendente,
            tasks: tasks.pendente,
        },
        {
            id: 'em_andamento',
            title: 'Em Andamento',
            color: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800/30 dark:bg-yellow-900/10',
            count: stats.em_andamento,
            tasks: tasks.em_andamento,
        },
        {
            id: 'concluida',
            title: 'Concluída',
            color: 'border-green-200 bg-green-50 dark:border-green-800/30 dark:bg-green-900/10',
            count: stats.concluida,
            tasks: tasks.concluida,
        },
    ];

    const handleDragStart = (event: DragStartEvent) => {
        const taskId = event.active.id as string;
        const allTasks = [...tasks.pendente, ...tasks.em_andamento, ...tasks.concluida];
        const task = allTasks.find(t => t.id.toString() === taskId);
        setActiveTask(task || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveTask(null);
            return;
        }

        const taskId = active.id as string;
        let newStatus = over.id as string;
        
        // Verifica se soltou sobre outra tarefa para descobrir a coluna correta
        const overTaskCheck = [...tasks.pendente, ...tasks.em_andamento, ...tasks.concluida].find(t => t.id.toString() === newStatus);
        
        if (overTaskCheck) {
            if (tasks.pendente.some(t => t.id.toString() === newStatus)) newStatus = 'pendente';
            else if (tasks.em_andamento.some(t => t.id.toString() === newStatus)) newStatus = 'em_andamento';
            else if (tasks.concluida.some(t => t.id.toString() === newStatus)) newStatus = 'concluida';
        }

        if (['pendente', 'em_andamento', 'concluida'].includes(newStatus)) {
            try {
                await router.put(`/tarefas/${taskId}/status`, {
                    status: newStatus.replace('_', ' '),
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['tasks', 'stats'],
                });
            } catch (error) {
                console.error('Erro ao atualizar status:', error);
            }
        }

        setActiveTask(null);
    };

    const handleCreateTask = () => {
        setEditingTask(null);
        setTaskDialogOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setTaskDialogOpen(true);
    };

    const handleDeleteTask = async (task: Task) => {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
        try {
            const response = await fetch(`/tarefas/${task.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            if (response.ok) router.reload();
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tarefas - ${project.name}`} />

            {/** Container principal com altura ajustada para não rolar a página toda, apenas o kanban */}
            <div className="flex flex-1 flex-col gap-6 p-6 h-[calc(100vh-4rem)] overflow-hidden">

                <div className="flex items-center justify-between flex-none">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Gerenciar Tarefas
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Gerencie as tarefas do projeto {project.name}
                        </p>
                    </div>
                    <Button
                        onClick={handleCreateTask}
                        className="bg-[#3D5B69] hover:bg-[#2c424b] dark:bg-[#3D5B69] dark:hover:bg-[#2c424b]"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Tarefa
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-none">
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.total}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {stats.pendente}
                        </div>
                        <div className="text-sm text-red-500 dark:text-red-300">Pendente</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {stats.em_andamento}
                        </div>
                        <div className="text-sm text-yellow-500 dark:text-yellow-300">Em Andamento</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {stats.concluida}
                        </div>
                        <div className="text-sm text-green-500 dark:text-green-300">Concluída</div>
                    </div>
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border flex-none">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3D5B69]/10">
                                        <Trello className="h-5 w-5 text-[#3D5B69]" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            {project.name}
                                        </h1>
                                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Folder className="h-3 w-3" />
                                                Projeto Ativo
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                Criado por: {project.creator?.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 flex-none">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                        Arraste tarefas entre colunas para alterar o status
                    </span>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
                        {columnConfigs.map((column) => (
                            <KanbanColumn
                                key={column.id}
                                id={column.id}
                                title={column.title}
                                color={column.color}
                                count={column.count}
                                tasks={column.tasks}
                                onEditTask={handleEditTask}
                                onDeleteTask={handleDeleteTask}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeTask && (
                            <TaskCard
                                task={activeTask}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                                isDragging
                            />
                        )}
                    </DragOverlay>
                </DndContext>
            </div>

            <TaskFormDialog
                open={taskDialogOpen}
                onOpenChange={setTaskDialogOpen}
                projectId={project.id}
                task={editingTask}
                onSuccess={() => router.reload()}
            />
        </AppLayout>
    );
}