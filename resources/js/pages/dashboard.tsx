import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    FolderKanban, 
    Users, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    TrendingUp,
    Briefcase
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface TaskStats {
    pendente: number;
    em_andamento: number;
    concluida: number;
}

interface AdminStats {
    total_projects: number;
    projects_active: number;
    projects_finished: number;
    total_users: number;
    tasks_overview: TaskStats;
}

interface ProjectData {
    id: number;
    name: string;
    status: string;
    progress: number;
    my_tasks: any[];
    stats: TaskStats;
}

interface DashboardProps {
    type: 'A' | 'U';
    stats?: AdminStats;     
    recent_projects?: any[]; 
    active_project?: ProjectData;
    my_projects_count?: number; 
    auth: { user: any };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const StatCard = ({ title, value, icon: Icon, description }: any) => (
    <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-sidebar-accent/10">
        <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
        </div>
        {description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
    </div>
);

const AdminView = ({ stats, recentProjects }: { stats: AdminStats, recentProjects: any[] }) => {
    return (
        <div className="flex flex-col gap-6">
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Total de Projetos" 
                    value={stats.total_projects} 
                    icon={FolderKanban} 
                    description={`${stats.projects_active} em andamento`}
                />
                <StatCard 
                    title="Usuários Ativos" 
                    value={stats.total_users} 
                    icon={Users} 
                    description="Usuários normai"
                />
                <StatCard 
                    title="Projetos Finalizados" 
                    value={stats.projects_finished} 
                    icon={CheckCircle2} 
                    description="Ciclo completo"
                />
                <StatCard 
                    title="Tarefas Pendentes" 
                    value={stats.tasks_overview.pendente} 
                    icon={Clock} 
                    description="Em todos os projetos"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                {/** Gráfico*/}
                <div className="col-span-4 rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-sidebar-accent/10">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Visão Geral de Tarefas</h3>
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div> Pendentes
                                </span>
                                <span className="font-medium">{stats.tasks_overview.pendente}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                <div className="h-full bg-yellow-500" style={{ width: `${(stats.tasks_overview.pendente / (stats.tasks_overview.pendente + stats.tasks_overview.em_andamento + stats.tasks_overview.concluida || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div> Em Andamento
                                </span>
                                <span className="font-medium">{stats.tasks_overview.em_andamento}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                <div className="h-full bg-blue-500" style={{ width: `${(stats.tasks_overview.em_andamento / (stats.tasks_overview.pendente + stats.tasks_overview.em_andamento + stats.tasks_overview.concluida || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div> Concluídas
                                </span>
                                <span className="font-medium">{stats.tasks_overview.concluida}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                <div className="h-full bg-green-500" style={{ width: `${(stats.tasks_overview.concluida / (stats.tasks_overview.pendente + stats.tasks_overview.em_andamento + stats.tasks_overview.concluida || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-3 rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-sidebar-accent/10">
                     <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Projetos Recentes</h3>
                     <div className="space-y-4">
                        {recentProjects.map((project) => (
                            <div key={project.id} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0 dark:border-gray-800">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{project.name}</p>
                                    <p className="text-xs text-gray-500">Criado por: {project.creator?.name}</p>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                    project.status === 'em andamento' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                                    project.status === 'finalizado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {project.status}
                                </span>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

const UserView = ({ activeProject, myProjectsCount }: { activeProject?: ProjectData, myProjectsCount?: number }) => {
    if (!activeProject) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border p-8 text-center">
                <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                    <Briefcase className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Nenhum Projeto Ativo</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Selecione um projeto na barra lateral para ver suas tarefas e estatísticas.
                </p>
                <p className="mt-1 text-xs text-gray-400">Você participa de {myProjectsCount} projetos.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-sidebar-border/70 bg-gradient-to-r from-[#3D5B69] to-[#2c424b] p-6 text-white md:flex-row md:items-center">
                <div>
                    <h2 className="text-2xl font-bold">{activeProject.name}</h2>
                    <p className="opacity-90">Status: {activeProject.status.charAt(0).toUpperCase() + activeProject.status.slice(1)}</p>
                </div>
                <div className="min-w-[200px] text-right">
                    <div className="mb-1 flex justify-between text-sm font-medium">
                        <span>Progresso</span>
                        <span>{activeProject.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                        <div className="h-full bg-white transition-all duration-500" style={{ width: `${activeProject.progress}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard 
                    title="A Fazer" 
                    value={activeProject.stats.pendente} 
                    icon={AlertCircle} 
                    description="Tarefas pendentes"
                />
                <StatCard 
                    title="Em Andamento" 
                    value={activeProject.stats.em_andamento} 
                    icon={Clock} 
                    description="Tarefas sendo executadas"
                />
                <StatCard 
                    title="Concluídas" 
                    value={activeProject.stats.concluida} 
                    icon={CheckCircle2} 
                    description="Tarefas finalizadas"
                />
            </div>

            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-sidebar-accent/10">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Tarefas Prioritárias</h3>
                    <LayoutDashboard className="h-4 w-4 text-gray-500" />
                </div>
                
                {activeProject.my_tasks.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500">Nenhuma tarefa encontrada neste projeto.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-100 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                <tr>
                                    <th className="pb-3 font-medium">Tarefa</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Prazo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {activeProject.my_tasks.map((task: any) => (
                                    <tr key={task.id} className="group">
                                        <td className="py-3 font-medium text-gray-800 dark:text-gray-200">{task.title}</td>
                                        <td className="py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                task.status === 'concluida' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                task.status === 'em andamento' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                            }`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-500">
                                            {new Date(task.deadline).toLocaleDateString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};


export default function Dashboard(props: DashboardProps) {
    const { type, stats, recent_projects, active_project, my_projects_count } = props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {type === 'A' && stats && recent_projects ? (
                    <AdminView stats={stats} recentProjects={recent_projects} />
                ) : (
                    <UserView activeProject={active_project} myProjectsCount={my_projects_count} />
                )}
            </div>
        </AppLayout>
    );
}