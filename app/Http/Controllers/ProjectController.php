<?php

namespace App\Http\Controllers;

use App\Models\Project;
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

        $query = Project::with('creator');

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
