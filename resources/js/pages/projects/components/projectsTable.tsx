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
import { type Paginated, type Project } from '@/types';
import { MoreHorizontal, Trash2, Pencil, CheckCircle2, Circle, User, Clock, AlertCircle } from 'lucide-react';

interface ProjectsTableProps {
    projects: Paginated<Project>;
    search: string;
    statusFilter: string;
    perPage: string;
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
}

export default function ProjectsTable({
    projects,
    search,
    statusFilter,
    perPage,
    onEdit,
    onDelete
}: ProjectsTableProps) {

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
        const icons: Record<string, any> = {
            'em andamento': Clock,
            'alerta': AlertCircle,
            'finalizado': CheckCircle2
        };
        return icons[status] || Clock;
    };

    const buildPageUrl = (page: number) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (statusFilter) params.append('status', statusFilter);
        params.append('per_page', perPage);
        params.append('page', page.toString());
        return `/projetos?${params.toString()}`;
    };

    const goToPage = (page: number | string) => {
        const params: any = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        params.per_page = parseInt(perPage) || 15;
        params.page = typeof page === 'string' ? parseInt(page) : page;

        router.get('/projetos', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePerPageChange = (value: string) => {
        const params: any = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        params.per_page = parseInt(value) || 15;
        params.page = 1;

        router.get('/projetos', params, {
            preserveState: true,
            preserveScroll: true,
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
                                Status
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                                Criado Por
                            </TableHead>
                            <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">
                                Ações
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {projects.data.map((project) => {
                            const StatusIcon = getStatusIcon(project.status);
                            return (
                                <TableRow
                                    key={project.id}
                                    className="border-sidebar-border/70 hover:bg-gray-50 dark:hover:bg-gray-900/30"
                                >
                                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    {project.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span>{project.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <StatusIcon className="h-4 w-4" />
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(project.status)}`}>
                                                {getStatusDisplay(project.status)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            {project.creator?.name || 'Usuário não encontrado'}
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
                                                    onClick={() => onEdit(project)}
                                                    className="cursor-pointer text-gray-700 dark:text-gray-300"
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(project)}
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

            {projects.data.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-sidebar-border/70 px-6 py-4 sm:flex-row dark:border-sidebar-border">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Mostrando {projects.from} a {projects.to} de {projects.total} resultados
                    </div>

                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <div className="hidden text-sm text-gray-500 sm:block">
                            Página {projects.current_page} de {projects.last_page}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(projects.current_page - 1)}
                                disabled={projects.current_page === 1}
                                className="border-sidebar-border/70 dark:border-sidebar-border"
                            >
                                Anterior
                            </Button>

                            <div className="hidden items-center gap-1 sm:flex">
                                {projects.links.slice(1, -1).map((link, index) => {
                                    if (link.label === '...') {
                                        return (
                                            <span key={`dots-${index}`} className="px-2 text-gray-500">
                                                ...
                                            </span>
                                        );
                                    }

                                    const isActive = link.active;
                                    const pageNumber = parseInt(link.label);

                                    return (
                                        <Button
                                            key={index}
                                            variant={isActive ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => goToPage(pageNumber)}
                                            className={`min-w-[2.5rem] border-sidebar-border/70 dark:border-sidebar-border ${isActive
                                                ? 'bg-[#3D5B69] text-white hover:bg-[#2c424b]'
                                                : ''
                                                }`}
                                        >
                                            {link.label}
                                        </Button>
                                    );
                                })}
                            </div>

                            <div className="sm:hidden">
                                <select
                                    value={projects.current_page}
                                    onChange={(e) => goToPage(e.target.value)}
                                    className="rounded-md border border-sidebar-border/70 bg-white px-3 py-1.5 text-sm dark:border-sidebar-border dark:bg-gray-800"
                                >
                                    {Array.from({ length: projects.last_page }, (_, i) => i + 1).map((page) => (
                                        <option key={page} value={page}>
                                            Página {page}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(projects.current_page + 1)}
                                disabled={projects.current_page === projects.last_page}
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

            {projects.data.length === 0 && (
                <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <Circle className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Nenhum projeto encontrado
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {search || statusFilter
                            ? 'Tente ajustar os filtros de busca.'
                            : 'Comece adicionando um novo projeto.'}
                    </p>
                </div>
            )}
        </div>
    );
}