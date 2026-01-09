import { useState, FormEvent, useEffect, KeyboardEvent } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { type BreadcrumbItem, type Project, type Paginated } from '@/types';
import { FolderPlus, Search, Filter } from 'lucide-react';
import ProjectsTable from './components/projectsTable';
import ProjectFormDialog from './components/projectFormDialog';

interface Props {
    projects: Paginated<Project>;
    filters: {
        search: string;
        status: string;
        per_page: number;
    };
}

interface ProjectFormData {
    name: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Projetos', href: '/projetos' },
];

const initialFormData: ProjectFormData = {
    name: '',
};

export default function Projects({ projects, filters }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [search, setSearch] = useState(filters.search);
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [perPage, setPerPage] = useState(filters.per_page.toString());
    const [initialLoad, setInitialLoad] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<ProjectFormData>(initialFormData);

    const openCreateDialog = () => {
        setMode('create');
        reset();
        setCurrentProject(null);
        setDialogOpen(true);
    };

    const openEditDialog = (project: Project) => {
        setMode('edit');
        setData({
            name: project.name
        });
        setCurrentProject(project);
        setDialogOpen(true);
    };

    const deleteProject = (project: Project) => {
        if (confirm('Tem certeza que deseja excluir este projeto?')) {
            router.delete(`/projetos/${project.id}`, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (mode === 'create') {
            post('/projetos', {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                },
                preserveScroll: true,
            });
        } else if (currentProject) {
            put(`/projetos/${currentProject.id}`, {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                },
                preserveScroll: true,
            });
        }
    };

    const updateField = (field: keyof ProjectFormData, value: string) => {
        setData(field, value);
    };

    const applyFilters = () => {
        setSearchLoading(true);
        const params: any = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        const perPageNum = parseInt(perPage) || 15;
        params.per_page = perPageNum;

        router.get('/projetos', params, {
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
        setStatusFilter('');
        setPerPage('15');
        router.get('/projetos', {}, {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!initialLoad) {
                const params: any = {};
                if (search) params.search = search;
                if (statusFilter) params.status = statusFilter;
                const perPageNum = parseInt(perPage) || 15;
                params.per_page = perPageNum;

                router.get('/projetos', params, {
                    preserveState: true,
                    replace: true,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [statusFilter]);

    useEffect(() => {
        if (!initialLoad) {
            setSearch(filters.search);
            setStatusFilter(filters.status);
            setPerPage(filters.per_page.toString());
        }
    }, [filters, initialLoad]);

    useEffect(() => {
        setInitialLoad(false);
    }, []);

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        const params: any = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        params.per_page = parseInt(value) || 15;

        router.get('/projetos', params, {
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
            <Head title="Projetos" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Gerenciar Projetos
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Gerencie os projetos do sistema
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="bg-[#3D5B69] hover:bg-[#2c424b] dark:bg-[#3D5B69] dark:hover:bg-[#2c424b]"
                    >
                        <FolderPlus className="mr-2 h-4 w-4" />
                        Novo Projeto
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
                                    placeholder="Buscar por nome do projeto"
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
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full rounded-md border border-sidebar-border/70 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D5B69] dark:border-sidebar-border dark:bg-gray-800"
                                >
                                    <option value="">Todos os status</option>
                                    <option value="em andamento">Em Andamento</option>
                                    <option value="alerta">Alerta</option>
                                    <option value="finalizado">Finalizado</option>
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

                <ProjectsTable
                    projects={projects}
                    search={search}
                    statusFilter={statusFilter}
                    perPage={perPage}
                    onEdit={openEditDialog}
                    onDelete={deleteProject}
                />
            </div>

            <ProjectFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                mode={mode}
                currentProject={currentProject}
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