<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user()->load('activeProject');

        $project = $user->activeProject;

        if (!$project) {
            return Inertia::render('tasks/index', [
                'project' => null,
                'tasks' => [
                    'pendente' => [],
                    'em_andamento' => [],
                    'concluida' => [],
                ],
                'stats' => [
                    'total' => 0,
                    'pendente' => 0,
                    'em_andamento' => 0,
                    'concluida' => 0,
                ]
            ]);
        }

        $allTasks = Task::where('project_id', $project->id)->get();

        $pendente = $allTasks->where('status', 'pendente')->values();
        $emAndamento = $allTasks->where('status', 'em andamento')->values();
        $concluida = $allTasks->where('status', 'concluida')->values();

        return Inertia::render('tasks/index', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'status' => $project->status,
                'creator' => $project->creator,
            ],
            'tasks' => [
                'pendente' => $pendente,
                'em_andamento' => $emAndamento,
                'concluida' => $concluida,
            ],
            'stats' => [
                'total' => $allTasks->count(),
                'pendente' => $pendente->count(),
                'em_andamento' => $emAndamento->count(),
                'concluida' => $concluida->count(),
            ]
        ]);
    }


    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => ['required', Rule::in(['pendente', 'em andamento', 'concluida'])],
            'deadline' => 'required|date',
            'project_id' => 'required|exists:projects,id',
        ]);

        $task = Task::create([
            'project_id' => $request->project_id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'deadline' => $request->deadline,
        ]);

        //IMPORTANTE:Para funcionar com Inertia, retorna redirect back
        if ($request->header('X-Inertia')) {
            return redirect()->back();
        }

        return response()->json([
            'success' => true,
            'task' => $task,
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => ['sometimes', Rule::in(['pendente', 'em andamento', 'concluida'])],
            'deadline' => 'sometimes|date',
        ]);

        $task->update($request->only(['title', 'description', 'status', 'deadline']));

        if ($request->header('X-Inertia')) {
            return redirect()->back();
        }

        return response()->json([
            'success' => true,
            'task' => $task->fresh(),
        ]);
    }

    public function updateStatus(Request $request, Task $task)
    {
        $request->validate([
            'status' => ['required', Rule::in(['pendente', 'em andamento', 'concluida'])],
        ]);

        $task->update(['status' => $request->status]);

        $projectId = $task->project_id;
        $allTasks = Task::where('project_id', $projectId)->get();

        $tasks = [
            'pendente' => $allTasks->where('status', 'pendente')->values(),
            'em_andamento' => $allTasks->where('status', 'em andamento')->values(),
            'concluida' => $allTasks->where('status', 'concluida')->values(),
        ];

        $stats = [
            'total' => $allTasks->count(),
            'pendente' => $tasks['pendente']->count(),
            'em_andamento' => $tasks['em_andamento']->count(),
            'concluida' => $tasks['concluida']->count(),
        ];

        if ($request->header('X-Inertia')) {
            return redirect()->back()->with([
                'tasks' => $tasks,
                'stats' => $stats,
            ]);
        }

        return response()->json([
            'success' => true,
            'task' => $task,
        ]);
    }

    public function destroy(Task $task)
    {
        $task->delete();

        if ($request->header('X-Inertia')) {
            return redirect()->back();
        }

        return response()->json([
            'success' => true,
            'message' => 'Tarefa excluída com sucesso.',
        ]);
    }

    public function getByProject(Project $project)
    {
        $tasks = Task::where('project_id', $project->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('status');

        return response()->json([
            'pendente' => $tasks->get('pendente', []),
            'em_andamento' => $tasks->get('em andamento', []),
            'concluida' => $tasks->get('concluida', []),
        ]);
    }
}
