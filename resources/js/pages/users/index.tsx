import { useState, FormEvent, useEffect, KeyboardEvent } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type BreadcrumbItem, type User, type Paginated } from '@/types';
import { UserPlus, Search, Filter } from 'lucide-react';
import UsersTable from './components/usersTable';
import UserFormDialog from './components/userFormDialog';

interface Props {
    users: Paginated<User>;
    filters: {
        search: string;
        type: string;
        per_page: number;
    };
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

export default function Users({ users, filters }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [search, setSearch] = useState(filters.search);
    const [typeFilter, setTypeFilter] = useState(filters.type);
    const [perPage, setPerPage] = useState(filters.per_page.toString());
    const [searchLoading, setSearchLoading] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<UserFormData>(initialFormData);

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
            router.delete(`/usuarios/${user.id}`, {
                preserveScroll: true,
                preserveState: true,
            });
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

    const applyFilters = () => {
        setSearchLoading(true);
        const params: Record<string, string | number> = {};
        if (search) params.search = search;
        if (typeFilter) params.type = typeFilter;
        const perPageNum = parseInt(perPage) || 15;
        params.per_page = perPageNum;

        router.get('/usuarios', params, {
            preserveState: true,
            replace: true,
            onFinish: () => {
                setSearchLoading(false);
            },
        });
    };

    const handleSearchKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const handleSearchIconClick = () => {
        applyFilters();
    };

    const clearFilters = () => {
        setSearch('');
        setTypeFilter('');
        setPerPage('15');
        router.get('/usuarios', {}, {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const params: Record<string, string | number> = {};
            if (search) params.search = search;
            if (typeFilter) params.type = typeFilter;
            params.per_page = parseInt(perPage) || 15;

            router.get('/usuarios', params, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [typeFilter, perPage]);

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        const params: Record<string, string | number> = {};
        if (search) params.search = search;
        if (typeFilter) params.type = typeFilter;
        params.per_page = parseInt(value) || 15;

        router.get('/usuarios', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCancelForm = () => {
        setDialogOpen(false);
        reset();
        clearErrors();
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

                <div className="rounded-lg border border-sidebar-border/70 bg-white p-4 dark:border-sidebar-border dark:bg-gray-800">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <Search
                                    className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${searchLoading ? 'text-gray-400 animate-pulse' : 'text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300'}`}
                                    onClick={handleSearchIconClick}
                                />
                                <Input
                                    placeholder="Buscar por nome ou email"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleSearchKeyPress}
                                    className="pl-10 border-sidebar-border/70 dark:border-sidebar-border"
                                    disabled={searchLoading}
                                />
                                {searchLoading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="w-full md:w-48">
                            <div className="flex items-center gap-2">
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full rounded-md border border-sidebar-border/70 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D5B69] dark:border-sidebar-border dark:bg-gray-800"
                                >
                                    <option value="">Todos os tipos</option>
                                    <option value="U">Usuário</option>
                                    <option value="A">Administrador</option>
                                </select>
                            </div>


                        </div>

                        <div className="w-full md:w-40">
                            <select
                                value={perPage}
                                onChange={(e) => handlePerPageChange(e.target.value)}
                                className="w-full rounded-md border border-sidebar-border/70 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D5B69] dark:border-sidebar-border dark:bg-gray-800"
                            >
                                <option value="5">5 por página</option>
                                <option value="15">15 por página</option>
                                <option value="25">25 por página</option>
                                <option value="50">50 por página</option>
                            </select>
                        </div>

                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="border-sidebar-border/70 dark:border-sidebar-border"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Limpar
                        </Button>
                    </div>
                </div>

                <UsersTable
                    users={users}
                    search={search}
                    typeFilter={typeFilter}
                    perPage={perPage}
                    onEdit={openEditDialog}
                    onDelete={deleteUser}
                />
            </div>

            <UserFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                mode={mode}
                currentUser={currentUser}
                data={data}
                errors={errors}
                processing={processing}
                onSubmit={handleSubmit}
                onCancel={handleCancelForm}
                updateField={updateField}
            />

        </AppLayout>
    );
}