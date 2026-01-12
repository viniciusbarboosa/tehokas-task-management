import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, FileText, RefreshCw, CheckCircle, Clock, AlertCircle, Folder, X } from 'lucide-react';
import { type Task } from '@/types';
import { useState } from 'react';

interface TaskDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task | null;
    onUpdateStatus: (taskId: number, newStatus: string) => Promise<void>;
}

export default function TaskDetailsDialog({
    open,
    onOpenChange,
    task,
    onUpdateStatus,
}: TaskDetailsDialogProps) {
    const [updating, setUpdating] = useState(false);

    if (!task) return null;

    const statusOptions = [
        { value: 'pendente', label: 'Pendente', icon: Clock, color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' },
        { value: 'em andamento', label: 'Em Andamento', icon: RefreshCw, color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' },
        { value: 'concluida', label: 'Concluída', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' },
    ];

    const getDeadlineColor = () => {
        if (!task.deadline) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        
        const today = new Date();
        const deadline = new Date(task.deadline);
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        if (diffDays <= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    };

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === task.status) return;
        
        setUpdating(true);
        try {
            await onUpdateStatus(task.id, newStatus);
            onOpenChange(false); 
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const currentStatus = statusOptions.find(s => s.value === task.status);
    const StatusIcon = currentStatus?.icon || Clock;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-sidebar-border/70 dark:border-sidebar-border">

                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-gray-900 px-6 py-4">
                    <div>
                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {task.title}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                            Detalhes completos da tarefa
                        </DialogDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Fechar</span>
                    </Button>
                </div>

                <div className="space-y-6 p-6">

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-white dark:bg-gray-700">
                                    <StatusIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Status atual
                                    </h3>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mt-1 ${currentStatus?.color}`}>
                                        <StatusIcon className="h-4 w-4" />
                                        {currentStatus?.label}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Criada em
                                </h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {new Date(task.created_at).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 text-lg">
                            Alterar status
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {statusOptions.filter(option => option.value !== task.status)
                                .map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <Button
                                            key={option.value}
                                            variant="outline"
                                            className={`flex flex-col items-center justify-center h-24 p-4 hover:scale-[1.02] transition-transform ${option.color.split(' ')[0]} border-2`}
                                            onClick={() => handleStatusChange(option.value)}
                                            disabled={updating}
                                        >
                                            <Icon className="h-8 w-8 mb-2" />
                                            <span className="text-sm font-medium">{option.label}</span>
                                        </Button>
                                    );
                                })}
                        </div>
                        {updating && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                                Atualizando status...
                            </p>
                        )}
                    </div>

                    <Separator />

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <h3 className="font-medium text-gray-700 dark:text-gray-300 text-lg">
                                Descrição
                            </h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 min-h-[120px]">
                            {task.description ? (
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {task.description}
                                </p>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 italic text-center py-8">
                                    Nenhuma descrição fornecida
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <h3 className="font-medium text-gray-700 dark:text-gray-300 text-lg">
                                    Prazo
                                </h3>
                            </div>
                            <div className={`px-4 py-3 rounded-lg ${getDeadlineColor()} flex items-center justify-between`}>
                                <div>
                                    <p className="font-medium">
                                        {task.deadline ? new Date(task.deadline).toLocaleDateString('pt-BR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'Sem prazo definido'}
                                    </p>
                                    {task.deadline && (
                                        <p className="text-sm opacity-80 mt-1">
                                            {(() => {
                                                const today = new Date();
                                                const deadline = new Date(task.deadline);
                                                const diffTime = deadline.getTime() - today.getTime();
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                
                                                if (diffDays < 0) return `Atrasado há ${Math.abs(diffDays)} dias`;
                                                if (diffDays === 0) return 'Vence hoje';
                                                if (diffDays === 1) return 'Vence amanhã';
                                                return `Vence em ${diffDays} dias`;
                                            })()}
                                        </p>
                                    )}
                                </div>
                                <Calendar className="h-6 w-6 opacity-70" />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <h3 className="font-medium text-gray-700 dark:text-gray-300 text-lg">
                                    Projeto
                                </h3>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-[#3D5B69]/10 flex items-center justify-center">
                                        <Folder className="h-5 w-5 text-[#3D5B69]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {task.project?.name || 'Projeto não especificado'}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            ID do projeto: {task.project_id}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 text-lg">
                            Informações adicionais
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">ID da tarefa</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                    #{task.id}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Última atualização</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                    {new Date(task.updated_at).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}