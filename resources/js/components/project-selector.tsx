// components/project-selector.tsx
import { useEffect, useState } from "react"
import { usePage } from "@inertiajs/react"
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
import { Check, Folder, X } from "lucide-react"

type Project = {
    id: number
    name: string
    status: string
}

type User = {
    id: number
    name: string
    email: string
    type: string
    active_project?: Project
}

export default function ProjectSelect() {
    const { props } = usePage<{ auth: { user: User } }>()
    const user = props.auth.user
    const activeProject = user.active_project

    const [open, setOpen] = useState(false)
    const [projects, setProjects] = useState<Project[]>([])
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)

    async function loadProjects(reset = false) {
        if (loading) return
        if (!hasMore && !reset) return

        setLoading(true)

        const currentPage = reset ? 1 : page

        try {
            const res = await fetch(
                `/projetos/acessiveis?page=${currentPage}&search=${search}`
            )

            const data = await res.json()

            const items = data.data ?? data

            setProjects(prev =>
                reset ? items : [...prev, ...items]
            )

            setHasMore(items.length > 0)
            setPage(currentPage + 1)
        } catch (e) {
            console.error("Erro ao buscar projetos", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            setProjects([])
            setPage(1)
            setHasMore(true)
            loadProjects(true)
        }
    }, [open])

    useEffect(() => {
        if (!open) return

        const t = setTimeout(() => {
            setProjects([])
            setPage(1)
            setHasMore(true)
            loadProjects(true)
        }, 400)

        return () => clearTimeout(t)
    }, [search, open])

    //scroll infinito
    function handleScroll(e: React.UIEvent<HTMLDivElement>) {
        const el = e.currentTarget

        if (
            el.scrollTop + el.clientHeight >=
            el.scrollHeight - 20
        ) {
            loadProjects()
        }
    }

    function getCsrfToken() {
        return document.cookie
            .split("; ")
            .find(row => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1]
    }

    async function handleSelect(project: Project) {
        try {
            const token = decodeURIComponent(getCsrfToken() ?? "")

            const res = await fetch("/projeto/ativo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": token,
                },
                body: JSON.stringify({
                    project_id: project.id,
                }),
            })

            if (res.ok) {
                window.location.reload()
            } else {
                console.error("Erro ao trocar projeto")
            }
        } catch (e) {
            console.error("Erro ao trocar projeto", e)
        }
    }

    //Limpa projeto
    async function handleClearProject() {
        if (!activeProject) return

        try {
            const token = decodeURIComponent(getCsrfToken() ?? "")

            const res = await fetch("/projeto/ativo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": token,
                },
                body: JSON.stringify({
                    project_id: null,
                }),
            })

            if (res.ok) {
                window.location.reload()
            } else {
                console.error("Erro ao limpar projeto")
            }
        } catch (e) {
            console.error("Erro ao limpar projeto", e)
        }
    }

    return (
        <div className="px-3 py-2">
            <div className="mb-2 text-xs font-medium text-gray-500">
                PROJETO ATUAL
            </div>

            <div className="flex gap-1">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-between truncate"
                        >
                            <div className="flex items-center gap-2 truncate">
                                <Folder className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                    {activeProject ? activeProject.name : "Selecione projeto"}
                                </span>
                            </div>
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[280px] p-0">
                        <Command>
                            <CommandInput
                                placeholder="Buscar projeto..."
                                value={search}
                                onValueChange={setSearch}
                            />

                            <CommandList
                                onScroll={handleScroll}
                                className="max-h-60 overflow-y-auto"
                            >
                                <CommandEmpty>
                                    Nenhum projeto encontrado.
                                </CommandEmpty>

                                <CommandGroup>
                                    {projects.map(project => (
                                        <CommandItem
                                            key={project.id}
                                            value={project.name}
                                            onSelect={() => handleSelect(project)}
                                            className="flex justify-between"
                                        >
                                            <span className="truncate">{project.name}</span>
                                            {activeProject?.id === project.id && (
                                                <Check className="h-4 w-4 flex-shrink-0" />
                                            )}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>

                                {loading && (
                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                        Carregando...
                                    </div>
                                )}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {activeProject && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleClearProject}
                        title="Limpar projeto selecionado"
                        className="flex-shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}