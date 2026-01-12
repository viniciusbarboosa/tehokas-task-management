import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    type: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface Project {
    id: number;
    name: string;
    status: 'em andamento' | 'alerta' | 'finalizado';
    created_by: number;
    created_at: string;
    updated_at: string;
    users_count;
    creator?: User;
    users?: User[];
    activities?: Activity[];
}

export type TaskStatus = 'pendente' | 'em andamento' | 'concluida';

export interface Task {
    id: number;
    project_id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    deadline: string;
    created_at: string;
    updated_at: string;
    project?: Project;
}