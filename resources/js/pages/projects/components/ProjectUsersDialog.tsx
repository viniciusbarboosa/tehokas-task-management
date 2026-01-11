import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Project, type User } from '@/types';
import { Users, UserPlus, UserMinus, Loader2, X } from 'lucide-react';
import { InfiniteSelectUsersProject } from '@/components/infinite-select-users-project';

interface ProjectUsersDialogProps {
    project: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface ProjectUsersData {
    current_users: User[];
}

export function ProjectUsersDialog({
    project,
    open,
    onOpenChange,
}: ProjectUsersDialogProps) {
    const [usersData, setUsersData] = useState<ProjectUsersData | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [addingUser, setAddingUser] = useState(false);
    const [removingUser, setRemovingUser] = useState<number | null>(null);
    const [selectKey, setSelectKey] = useState(0);

    useEffect(() => {
        if (open && project) {
            loadUsers();
            setSelectKey(prev => prev + 1); 
        } else {
            setUsersData(null);
            setSelectedUserId('');
        }
    }, [open, project]);

    const loadUsers = async () => {
        if (!project) return;

        setLoading(true);
        try {
            const response = await fetch(`/projetos/${project.id}/usuarios`);
            const data = await response.json();
            setUsersData(data);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        if (!project || !selectedUserId) return;

        setAddingUser(true);

        try {
            const response = await fetch(`/projetos/${project.id}/adicionar-usuario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ user_id: selectedUserId }),
            });

            const data = await response.json();

            if (data.success) {
                await loadUsers();
                setSelectedUserId('');
                setSelectKey(prev => prev + 1);

                project.users_count = data.users_count;
                router.reload({ only: ['projects'] });
            } else {
                alert(data.message || 'Erro ao adicionar usuário');
            }
        } catch (error) {
            console.error('Erro ao adicionar usuário:', error);
            alert('Erro ao adicionar usuário');
        } finally {
            setAddingUser(false);
        }
    };

    const handleRemoveUser = async (userId: number) => {
        if (!project) return;

        if (!confirm('Tem certeza que deseja remover este usuário do projeto?')) return;

        setRemovingUser(userId);

        try {
            const response = await fetch(`/projetos/${project.id}/remover-usuario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ user_id: userId }),
            });

            const data = await response.json();

            if (data.success) {
                await loadUsers();

                project.users_count = data.users_count;
                router.reload({ only: ['projects'] });
            }
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
        } finally {
            setRemovingUser(null);
        }
    };

    const getUserTypeDisplay = (type: string) => {
        return type === 'A' ? 'Administrador' : 'Usuário';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] border-sidebar-border/70 dark:border-sidebar-border">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Gerenciar Usuários
                        {project && (
                            <span className="text-gray-600 dark:text-gray-400 font-normal">
                                - {project.name}
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Adicione ou remova usuários deste projeto
                    </DialogDescription>
                </DialogHeader>

                {project && (
                    <div className="space-y-6">

                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                Adicionar Usuário
                            </h3>
                            <InfiniteSelectUsersProject
                                key={selectKey} //VERIFIQUE ESSA KEY E PRA FAZER O RESERT E ATUALIZAR OS DADOS AO ADICONAR/REMOVER
                                value={selectedUserId}
                                onValueChange={setSelectedUserId}
                                placeholder="Buscar usuário por nome ou email..."
                                projectId={project.id}
                                disabled={addingUser}
                            />
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleAddUser}
                                    disabled={!selectedUserId || addingUser}
                                    className="bg-[#3D5B69] hover:bg-[#2c424b] dark:bg-[#3D5B69] dark:hover:bg-[#2c424b]"
                                >
                                    {addingUser ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adicionando...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Adicionar ao Projeto
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                    Usuários do Projeto
                                </h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Total: {project.users_count || 0}
                                </span>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                            ) : usersData ? (
                                <ScrollArea className="h-64">
                                    <div className="space-y-2 pr-4">
                                        {usersData.current_users.length === 0 ? (
                                            <div className="rounded-lg border border-sidebar-border/70 p-8 text-center dark:border-sidebar-border">
                                                <Users className="h-12 w-12 mx-auto text-gray-400" />
                                                <p className="mt-4 text-gray-600 dark:text-gray-400">
                                                    Nenhum usuário atribuído a este projeto
                                                </p>
                                            </div>
                                        ) : (
                                            usersData.current_users.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center justify-between rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                    {user.name}
                                                                </span>
                                                                <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${user.type === 'A'
                                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                    }`}>
                                                                    {getUserTypeDisplay(user.type)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveUser(user.id)}
                                                        disabled={removingUser === user.id}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 ml-2 flex-shrink-0"
                                                    >
                                                        {removingUser === user.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <UserMinus className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            ) : null}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}