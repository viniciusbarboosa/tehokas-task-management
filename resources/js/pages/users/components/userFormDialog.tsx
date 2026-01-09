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
import { type User } from '@/types';
import { UserPlus, Pencil, Shield, User2Icon } from 'lucide-react';

interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    type: string;
}

interface UserFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    currentUser: User | null;
    data: UserFormData;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: FormEvent) => void;
    onCancel: () => void;
    updateField: (field: keyof UserFormData, value: string) => void;
}

export default function UserFormDialog({
    open,
    onOpenChange,
    mode,
    currentUser,
    data,
    errors,
    processing,
    onSubmit,
    onCancel,
    updateField
}: UserFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border border-sidebar-border/70 dark:border-sidebar-border"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3D5B69]/10">
                            {mode === 'create' ? (
                                <UserPlus className="h-5 w-5 text-[#3D5B69]" />
                            ) : (
                                <Pencil className="h-5 w-5 text-[#3D5B69]" />
                            )}
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">
                                {mode === 'create'
                                    ? 'Preencha os dados do novo usuário.'
                                    : 'Atualize as informações do usuário.'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                            Nome *
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            required
                            className="border-sidebar-border/70 dark:border-sidebar-border"
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                            Email *
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            required
                            className="border-sidebar-border/70 dark:border-sidebar-border"
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300">
                            Tipo de Usuário
                        </Label>

                        <div className="flex gap-4">
                            <label
                                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors ${data.type === 'U'
                                    ? 'border-[#3D5B69] bg-[#3D5B69]/10 dark:border-[#3D5B69] dark:bg-[#3D5B69]/20'
                                    : 'border-sidebar-border/70 hover:bg-gray-50 dark:border-sidebar-border dark:hover:bg-gray-900/30'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="type"
                                    value="U"
                                    checked={data.type === 'U'}
                                    onChange={(e) => updateField('type', e.target.value)}
                                    className="sr-only"
                                />
                                <User2Icon className="h-4 w-4" />
                                <span className="text-sm font-medium">Usuário</span>
                            </label>

                            <label
                                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors ${data.type === 'A'
                                    ? 'border-purple-500 bg-purple-50 dark:border-purple-500 dark:bg-purple-900/20'
                                    : 'border-sidebar-border/70 hover:bg-gray-50 dark:border-sidebar-border dark:hover:bg-gray-900/30'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="type"
                                    value="A"
                                    checked={data.type === 'A'}
                                    onChange={(e) => updateField('type', e.target.value)}
                                    className="sr-only"
                                />
                                <Shield className="h-4 w-4" />
                                <span className="text-sm font-medium">Administrador</span>
                            </label>
                        </div>

                        <InputError message={errors.type} className="mt-1" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                            Senha {mode === 'edit' && <span className="text-gray-500">(Troca Opcional)</span>}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => updateField('password', e.target.value)}
                            autoComplete="new-password"
                            className="border-sidebar-border/70 dark:border-sidebar-border"
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    {(mode === 'create' || data.password) && (
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className="text-gray-700 dark:text-gray-300">
                                Confirmar Senha
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    updateField('password_confirmation', e.target.value)
                                }
                                className="border-sidebar-border/70 dark:border-sidebar-border"
                            />
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
                            {processing ? 'Salvando...' : (mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}