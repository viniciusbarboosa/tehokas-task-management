import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Check, Users } from "lucide-react"

interface InfiniteSelectUsersProjectProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    projectId: number;
    disabled?: boolean;
}

type UserType = {
    id: number
    name: string
    email: string
    type: string
}

export function InfiniteSelectUsersProject({
    value,
    onValueChange,
    placeholder = "Selecionar usuário...",
    projectId,
    disabled = false,
}: InfiniteSelectUsersProjectProps) {
    const [open, setOpen] = useState(false)
    const [users, setUsers] = useState<UserType[]>([])
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    async function loadUsers(reset = false) {
        if (loading) return
        if (!hasMore && !reset) return

        setLoading(true)
        const currentPage = reset ? 1 : page

        try {
            const url = new URL(`/projetos/${projectId}/buscar-usuarios-disponiveis`, window.location.origin)
            url.searchParams.append('page', currentPage.toString())
            url.searchParams.append('per_page', '15')
            if (search) {
                url.searchParams.append('search', search)
            }

            const res = await fetch(url.toString())
            const data = await res.json()

            const items = data.data || []

            setUsers(prev => reset ? items : [...prev, ...items])
            setHasMore(data.has_more)
            setPage(currentPage + 1)
        } catch (e) {
            console.error("Erro ao buscar usuários", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            setUsers([])
            setPage(1)
            setHasMore(true)
            loadUsers(true)
        }
    }, [open])

    useEffect(() => {
        if (!open) return

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        searchTimeoutRef.current = setTimeout(() => {
            setUsers([])
            setPage(1)
            setHasMore(true)
            loadUsers(true)
        }, 300)

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
                searchTimeoutRef.current = null
            }
        }
    }, [search])

    function handleScroll(e: React.UIEvent<HTMLDivElement>) {
        const el = e.currentTarget

        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
            loadUsers()
        }
    }

    function handleSelect(user: UserType) {
        onValueChange(user.id.toString())
        setOpen(false)
        setSearch("")
    }

    const getUserTypeDisplay = (type: string) => {
        return type === 'A' ? 'Administrador' : 'Usuário'
    }

    const selectedUser = users.find(u => u.id.toString() === value)

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setSearch("")
        }
        setOpen(isOpen)
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-between truncate"
                    disabled={disabled}
                >
                    <div className="flex items-center gap-2 truncate">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                            {selectedUser ? selectedUser.name : placeholder}
                        </span>
                    </div>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Buscar usuário por nome ou email..."
                        value={search}
                        onValueChange={setSearch}
                        autoFocus
                    />

                    <CommandList
                        onScroll={handleScroll}
                        className="max-h-64 overflow-y-auto"
                    >
                        <CommandEmpty>
                            {search ? 'Nenhum usuário encontrado' : 'Digite para buscar usuários...'}
                        </CommandEmpty>

                        <CommandGroup>
                            {users.map(user => (
                                <CommandItem
                                    key={user.id}
                                    value={`${user.name} ${user.email}`}
                                    onSelect={() => handleSelect(user)}
                                    className="flex justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                {user.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {user.email}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex-shrink-0">
                                                    {getUserTypeDisplay(user.type)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {value === user.id.toString() && (
                                        <Check className="h-4 w-4 flex-shrink-0 text-blue-500" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>

                        {loading && (
                            <div className="p-3 text-center text-sm text-muted-foreground">
                                Carregando mais usuários...
                            </div>
                        )}

                        {!hasMore && users.length > 0 && (
                            <div className="p-2 text-center text-sm text-muted-foreground border-t">
                                Todos os usuários carregados
                            </div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}