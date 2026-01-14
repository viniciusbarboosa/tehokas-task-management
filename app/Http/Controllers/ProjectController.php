<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;


class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:em andamento,alerta,finalizado',
            'per_page' => 'nullable|integer|min:5|max:100',
        ]);

        $query = Project::with('creator')
            ->withCount('users')
            ->withCount([
                'tasks as tasks_total',
                'tasks as tasks_late' => function ($q) {
                    $q->where('status', '!=', 'finalizada')
                    ->whereDate('deadline', '<', now());
                }
            ]);


        if (!empty($validated['search'] ?? '')) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if (!empty($validated['status'] ?? '')) {
            $query->where('status', $validated['status']);
        }

        $perPage = $validated['per_page'] ?? 15;
        $projects = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return Inertia::render('projects/index', [
            'projects' => $projects,
            'filters' => [
                'search' => $validated['search'] ?? '',
                'status' => $validated['status'] ?? '',
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        Project::create([
            'name' => $request->name,
            'status' => 'em andamento', //STATUS PADRAO
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('projetos.index')->with('success', 'Projeto criado com sucesso.');
    }


    public function update(Request $request, Project $projeto)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $projeto->update([
            'name' => $request->name,

        ]);

        return redirect()->route('projetos.index')->with('success', 'Projeto atualizado com sucesso.');
    }

    public function finish(Project $projeto)
    {
        $projeto->update([
            'status' => 'finalizado'
        ]);

        return redirect()->back()->with('success', 'Projeto finalizado com sucesso!');
    }

    //METODOS PARA GERENCIAR USAURIOS DO PROJETO
    public function getUsers(Project $projeto, Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        
        // CORREÇÃO: Especificar tabela users
        $currentUsers = $projeto->users()
            ->select('users.id', 'users.name', 'users.email', 'users.type')
            ->orderBy('users.name')
            ->get();
        
        $availableUsersQuery = User::query()
            ->whereNotIn('id', $currentUsers->pluck('id'));
        
        if ($search) {
            $availableUsersQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $availableUsers = $availableUsersQuery
            ->orderBy('name')
            ->paginate($perPage, ['id', 'name', 'email', 'type'], 'page', $page);
        
        return response()->json([
            'current_users' => $currentUsers,
            'available_users' => [
                'data' => $availableUsers->items(),
                'current_page' => $availableUsers->currentPage(),
                'last_page' => $availableUsers->lastPage(),
                'total' => $availableUsers->total(),
                'has_more' => $availableUsers->hasMorePages(),
            ],
        ]);
    }

    public function addUser(Request $request, Project $projeto)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $projeto->users()->syncWithoutDetaching([$request->user_id]);

        return response()->json([
            'success' => true,
            'message' => 'Usuário adicionado ao projeto.',
            'users_count' => $projeto->users()->count(),
        ]);
    }

    public function removeUser(Request $request, Project $projeto)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $projeto->users()->detach($request->user_id);

        return response()->json([
            'success' => true,
            'message' => 'Usuário removido do projeto.',
            'users_count' => $projeto->users()->count(),
        ]);
    }

    public function searchAvailableUsers(Project $projeto, Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        
        // CORREÇÃO: Usar subquery para evitar ambiguidade
        $query = User::query()
            ->whereNotIn('id', function($q) use ($projeto) {
                $q->select('user_id')
                  ->from('project_user')
                  ->where('project_id', $projeto->id);
            });
        
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $users = $query->orderBy('name')
            ->paginate($perPage, ['id', 'name', 'email', 'type'], 'page', $page);
        
        return response()->json([
            'data' => $users->items(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
            'total' => $users->total(),
            'has_more' => $users->hasMorePages(),
        ]);
    }

    //FUNÇOES PARA CAMPO SELECT DE PROJETOS DA SIDEBAR
    public function accessible(Request $request)
    {
        try {
            $user = auth()->user();

            $page = (int) $request->input('page', 1);
            $search = (string) $request->input('search', '');
            $perPage = 20;

            $projects = $user->accessibleProjects($page, $perPage, $search);

            return response()->json([
                'data' => $projects->items(),
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'total' => $projects->total(),
                'has_more' => $projects->hasMorePages(),
            ]);
        } catch (\Throwable $e) {

            return response()->json([
                'message' => 'Erro interno ao buscar projetos'
            ], 500);

        }
    }

    public function setActive(Request $request)
    {
        $request->validate([
            'project_id' => 'nullable|exists:projects,id',
        ]);

        $user = auth()->user();

        $user->active_project_id = $request->project_id;
        $user->save();

        return response()->json([
            'success' => true,
        ]);
    }


    public function getActive()
    {
        $user = auth()->user()->load('activeProject.creator');

        return response()->json([
            'active_project' => $user->activeProject
        ]);
    }
}
