import { FormEvent } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { type Project } from '@/types';
import { type LucideIcon } from 'lucide-react';
import { FolderPlus, Pencil, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProjectFormData {
    name: string;
}

interface ProjectFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    currentProject: Project | null;
    data: ProjectFormData;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: FormEvent) => void;
    onCancel: () => void;
    updateField: (field: keyof ProjectFormData, value: string) => void;
}

export default function ProjectFormDialog({
    open,
    onOpenChange,
    mode,
    currentProject,
    data,
    errors,
    processing,
    onSubmit,
    onCancel,
    updateField
}: ProjectFormDialogProps) {
    const getStatusDisplay = (status: string) => {
        const statusMap: Record<string, string> = {
            'em andamento': 'Em Andamento',
            'alerta': 'Alerta',
            'finalizado': 'Finalizado'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'em andamento': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'alerta': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'finalizado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, LucideIcon> = {
            'em andamento': Clock,
            'alerta': AlertCircle,
            'finalizado': CheckCircle2
        };
        return icons[status] || Clock;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border border-sidebar-border/70 dark:border-sidebar-border"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3D5B69]/10">
                            {mode === 'create' ? (
                                <FolderPlus className="h-5 w-5 text-[#3D5B69]" />
                            ) : (
                                <Pencil className="h-5 w-5 text-[#3D5B69]" />
                            )}
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {mode === 'create' ? 'Novo Projeto' : 'Editar Projeto'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">
                                {mode === 'create'
                                    ? 'Preencha os dados do novo projeto.'
                                    : 'Atualize as informações do projeto.'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                            Nome do Projeto *
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            required
                            className="border-sidebar-border/70 dark:border-sidebar-border"
                            placeholder="Ex: Sistema de Gestão"
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    {/*STATUS NAO EDITA AQUI E APENAS VISUAL*/}
                    {mode === 'edit' && currentProject && (
                        <div className="space-y-2">
                            <Label className="text-gray-700 dark:text-gray-300">
                                Status do Projeto
                            </Label>
                            <div className="flex items-center gap-2 rounded-lg border border-sidebar-border/70 bg-gray-50 p-3 dark:border-sidebar-border dark:bg-gray-800">
                                {(() => {
                                    const StatusIcon = getStatusIcon(currentProject.status);
                                    return (
                                        <>
                                            <StatusIcon className="h-5 w-5" />
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(currentProject.status)}`}>
                                                {getStatusDisplay(currentProject.status)}
                                            </span>
                                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                                (Status não editável)
                                            </span>
                                        </>
                                    );
                                })()}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                O status do projeto é gerenciado automaticamente pelo sistema.
                            </p>
                        </div>
                    )}

                    <DialogFooter className="gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="border-sidebar-border/70 dark:border-sidebar-border"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-[#3D5B69] text-white hover:bg-[#2c424b] dark:bg-[#3D5B69] dark:text-white dark:hover:bg-[#2c424b]"
                        >
                            {processing ? 'Salvando...' : (mode === 'create' ? 'Criar Projeto' : 'Salvar Alterações')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}