import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
            <Head title="Tehokas">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <header className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <Link href="/">
                        <img src="/images/tehokaslogopngnomeelogo.png" alt="Tehokas Logo" className="h-8 w-auto" />
                    </Link>

                    {/* MENU DO DESKTOP */}
                    <nav className="hidden items-center gap-4 lg:flex">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Entrar
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Cadastrar
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>

                    {/**  MENU MOBILE*/}
                    <div className="lg:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Abrir menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {auth.user ? (
                                    <DropdownMenuItem asChild>
                                        <Link href={dashboard()}>Dashboard</Link>
                                    </DropdownMenuItem>
                                ) : (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href={login()}>Entrar</Link>
                                        </DropdownMenuItem>
                                        {canRegister && (
                                            <DropdownMenuItem asChild>
                                                <Link href={register()}>Cadastrar</Link>
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <main>
                {/** HERO */}
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        {/**Coluna da Esquerda */}
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                                Organize, Estruture e <span className="text-[#3D5B69]">Supere Desafios</span>
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                Nosso Sistema ajuda empresas a tornarem seus negócios mais organizados e estruturados, superando assim os desafios competitivos impostos pelo mercado.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                                <a
                                    href="https://tehokas.com.br"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-md bg-[#3D5B69] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2c424b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Saber Mais
                                </a>
                            </div>
                        </div>

                        {/**Coluna Direita */}            
                        <div>
                            <img
                                src="/images/lading/walpapergestao1.jpg"
                                alt="Equipe organizando processos de negócios"
                                className="h-auto w-full rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}