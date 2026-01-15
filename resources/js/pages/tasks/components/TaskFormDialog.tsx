import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Loader2 } from 'lucide-react';
import { type Task } from '@/types';

interface TaskFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number;
    task?: Task | null;
    onSuccess: () => void;
}

export default function TaskFormDialog({
    open,
    onOpenChange,
    projectId,
    task,
    onSuccess,
}: TaskFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'pendente',
        deadline: getTodayLocal(),
    });

    function getTodayLocal() {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }



    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || '',
                status: task.status,
                deadline: task.deadline,
            });
        } else {
            setFormData({
                title: '',
                description: '',
                status: 'pendente',
                deadline: getTodayLocal(),
            });
        }
    }, [task, open]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = task ? `/tarefas/${task.id}` : '/tarefas';
            const method = task ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
                    ),
                },

                body: JSON.stringify({
                    ...formData,
                    project_id: projectId,
                }),
            });

            if (response.ok) {
                onSuccess();
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Erro ao salvar tarefa:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] w-full max-w-full overflow-hidden border-sidebar-border/70 dark:border-sidebar-border">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100">
                        {task ? 'Editar Tarefa' : 'Nova Tarefa'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
                            Título *
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                            className="mt-1 border-sidebar-border/70 dark:border-sidebar-border"
                            placeholder="Digite o título da tarefa"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                            Descrição
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="mt-1 w-full max-w-full resize-none overflow-y-auto whitespace-pre-wrap break-all"
                            placeholder="Descreva a tarefa..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="deadline" className="text-gray-700 dark:text-gray-300">
                            Prazo *
                        </Label>
                        <div className="mt-1 flex items-center">
                            <Input
                                id="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                                required
                                className="border-sidebar-border/70 dark:border-sidebar-border"
                            />
                        </div>
                    </div>

                    {task && (
                        <div>
                            <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">
                                Status
                            </Label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                className="mt-1 w-full rounded-md border border-sidebar-border/70 bg-white px-3 py-2 text-sm dark:border-sidebar-border dark:bg-gray-800"
                            >
                                <option value="pendente">Pendente</option>
                                <option value="em andamento">Em Andamento</option>
                                <option value="concluida">Concluída</option>
                            </select>
                        </div>
                    )}

                    <DialogFooter className="gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-sidebar-border/70 dark:border-sidebar-border"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#3D5B69] hover:bg-[#2c424b] dark:bg-[#3D5B69] dark:hover:bg-[#2c424b]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                task ? 'Salvar Alterações' : 'Criar Tarefa'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
