import { router } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Paginated, type User } from '@/types';
import { MoreHorizontal, Trash2, Pencil, Shield, User2Icon } from 'lucide-react';

interface UsersTableProps {
    users: Paginated<User>;
    search: string;
    typeFilter: string;
    perPage: string;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    authUser: User;
}

export default function UsersTable({
    users,
    search,
    typeFilter,
    perPage,
    onEdit,
    onDelete,
    authUser,
}: UsersTableProps) {

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

    const getVisiblePages = () => {
        const current = users.current_page;
        const last = users.last_page;
        const delta = 2;
        const range: number[] = [];
        const rangeWithDots: (number | string)[] = [];

        for (let i = 1; i <= last; i++) {
            if (
                i === 1 ||
                i === last ||
                (i >= current - delta && i <= current + delta)
            ) {
                range.push(i);
            }
        }

        range.forEach((page, index) => {
            const previousPage = range[index - 1];
            if (previousPage && page - previousPage > 1) {
                rangeWithDots.push('...');
            }
            rangeWithDots.push(page);
        });

        return rangeWithDots;
    };

    const buildPageUrl = (page: number | string) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (typeFilter) params.append('type', typeFilter);
        const perPageNum = parseInt(perPage) || 15;
        params.append('per_page', perPageNum.toString());
        if (typeof page === 'number') {
            params.append('page', page.toString());
        }
        return `/usuarios?${params.toString()}`;
    };

    const handlePerPageChange = (value: string) => {
        const params: Record<string, string | number> = {};

        if (search) params.search = search;
        if (typeFilter) params.type = typeFilter;
        params.per_page = parseInt(value) || 15;

        router.get('/usuarios', params, {
            preserveState: true,
            replace: true,
        });
    };

    return (
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
                        {users.data.map((user) => {
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
                                                
                                                {!(user.type == 'A' && !authUser.admin_main) && (
                                                        <DropdownMenuItem
                                                            onClick={() => onEdit(user)}
                                                            className="cursor-pointer text-gray-700 dark:text-gray-300"
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                    )}

                                                <DropdownMenuItem
                                                    onClick={() => onDelete(user)}
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

            {users.data.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-sidebar-border/70 px-6 py-4 sm:flex-row dark:border-sidebar-border">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Mostrando {users.from} a {users.to} de {users.total} resultados
                    </div>

                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <div className="hidden text-sm text-gray-500 sm:block">
                            Página {users.current_page} de {users.last_page}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (users.prev_page_url) {
                                        const url = buildPageUrl(users.current_page - 1);
                                        router.get(url, {}, { preserveState: true });
                                    }
                                }}
                                disabled={!users.prev_page_url}
                                className="border-sidebar-border/70 dark:border-sidebar-border"
                            >
                                Anterior
                            </Button>

                            <div className="hidden items-center gap-1 sm:flex">
                                {getVisiblePages().map((page, index) => {
                                    if (page === '...') {
                                        return (
                                            <span key={`dots-${index}`} className="px-2 text-gray-500">
                                                ...
                                            </span>
                                        );
                                    }

                                    const isActive = page === users.current_page;

                                    return (
                                        <Button
                                            key={index}
                                            variant={isActive ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                                const url = buildPageUrl(page);
                                                router.get(url, {}, { preserveState: true });
                                            }}
                                            className={`min-w-[2.5rem] border-sidebar-border/70 dark:border-sidebar-border ${isActive
                                                ? 'bg-[#3D5B69] text-white hover:bg-[#2c424b]'
                                                : ''
                                                }`}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}
                            </div>

                            <div className="sm:hidden">
                                <select
                                    value={users.current_page}
                                    onChange={(e) => {
                                        const page = e.target.value;
                                        const url = buildPageUrl(page);
                                        router.get(url, {}, { preserveState: true });
                                    }}
                                    className="rounded-md border border-sidebar-border/70 bg-white px-3 py-1.5 text-sm dark:border-sidebar-border dark:bg-gray-800"
                                >
                                    {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                                        <option key={page} value={page}>
                                            Página {page}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (users.next_page_url) {
                                        const url = buildPageUrl(users.current_page + 1);
                                        router.get(url, {}, { preserveState: true });
                                    }
                                }}
                                disabled={!users.next_page_url}
                                className="border-sidebar-border/70 dark:border-sidebar-border"
                            >
                                Próxima
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Itens:</span>
                            <select
                                value={perPage}
                                onChange={(e) => handlePerPageChange(e.target.value)}
                                className="rounded-md border border-sidebar-border/70 bg-white px-2 py-1 text-sm dark:border-sidebar-border dark:bg-gray-800"
                            >
                                <option value="5">5</option>
                                <option value="15">15</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {users.data.length === 0 && (
                <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <User2Icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Nenhum usuário encontrado
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {search || typeFilter
                            ? 'Tente ajustar os filtros de busca.'
                            : 'Comece adicionando um novo usuário.'}
                    </p>
                </div>
            )}
        </div>
    );
}