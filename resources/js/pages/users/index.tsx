import { useState, FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import InputError from '@/components/input-error';
import { type BreadcrumbItem, type User } from '@/types';
import { router } from '@inertiajs/react';
import { MoreHorizontal, PlusCircle, Trash2, Pencil, UserPlus, Shield, User2Icon } from 'lucide-react';

interface Props {
    users: User[];
}

interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    type: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Usuários', href: '/usuarios' },
];

const initialFormData: UserFormData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    type: 'U', 
};

export default function Users({ users }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm<UserFormData>(initialFormData);

    const openCreateDialog = () => {
        setMode('create');
        reset();
        setCurrentUser(null);
        setDialogOpen(true);
    };

    const openEditDialog = (user: User) => {
        setMode('edit');
        setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            type: user.type || 'U',
        });
        setCurrentUser(user);
        setDialogOpen(true);
    };

    const deleteUser = (user: User) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            router.delete(`/usuarios/${user.id}`);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (mode === 'create') {
            post('/usuarios', {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                },
                preserveScroll: true,
            });
        } else if (currentUser) {
            put(`/usuarios/${currentUser.id}`, {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                },
                preserveScroll: true,
            });
        }
    };

    const updateField = (field: keyof UserFormData, value: string) => {
        setData(field, value);
    };

    const getTypeDisplay = (type: string) => {
        if (type === 'A') return 'Administrador';
        if (type === 'U') return 'Usuário';
        return type || 'Usuário';
    };

    const getTypeColor = (type: string) => {
        const t = type || 'U';
        if (t === 'A') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        if (t === 'U') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    const getTypeIcon = (type: string) => {
        const t = type || 'U';
        return t === 'A' ? Shield : User2Icon;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuários" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Gerenciar Usuários
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Gerencie os usuários do sistema e suas permissões
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="bg-[#3D5B69] hover:bg-[#2c424b] dark:bg-[#3D5B69] dark:hover:bg-[#2c424b]"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Novo Usuário
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-gray-800">
                    <div className="overflow-hidden rounded-xl">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                                <TableRow className="border-sidebar-border/70 hover:bg-transparent">
                                    <TableHead className="h-12 font-semibold text-gray-700 dark:text-gray-300">
                                        Nome
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                                        Email
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                                        Tipo
                                    </TableHead>
                                    <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">
                                        Ações
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                    const TypeIcon = getTypeIcon(user.type || 'U');
                                    return (
                                        <TableRow
                                            key={user.id}
                                            className="border-sidebar-border/70 hover:bg-gray-50 dark:hover:bg-gray-900/30"
                                        >
                                            <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span>{user.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-400">
                                                {user.email}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <TypeIcon className="h-4 w-4" />
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getTypeColor(user.type || 'U')}`}>
                                                        {getTypeDisplay(user.type || 'U')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Abrir menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-40 border border-sidebar-border/70 dark:border-sidebar-border"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() => openEditDialog(user)}
                                                            className="cursor-pointer text-gray-700 dark:text-gray-300"
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => deleteUser(user)}
                                                            className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md border border-sidebar-border/70 dark:border-sidebar-border">
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

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                                Nome *
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                required
                                autoFocus
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

                        {/** Confirmar senha so aparece no create*/}
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
                                onClick={() => setDialogOpen(false)}
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
        </AppLayout>
    );
}