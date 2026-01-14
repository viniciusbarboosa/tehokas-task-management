<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
      public function index(Request $request)
      {
        $user = auth()->user();

        if ($user->type === 'A') {
            
            $taskStats = Task::selectRaw("
                count(*) as total,
                count(case when status = 'pendente' then 1 end) as pendente,
                count(case when status = 'em andamento' then 1 end) as em_andamento,
                count(case when status = 'concluida' then 1 end) as concluida
            ")->first();

            $projectStats = Project::selectRaw("
                count(*) as total,
                count(case when status = 'em andamento' then 1 end) as active,
                count(case when status = 'finalizado' then 1 end) as finished
            ")->first();

            return Inertia::render('dashboard', [
                'auth' => ['user' => $user],
                'type' => 'A',
                'stats' => [
                    'total_projects' => $projectStats->total,
                    'projects_active' => $projectStats->active,
                    'projects_finished' => $projectStats->finished,
                    'total_users' => User::where('type', 'U')->count(),
                    'tasks_overview' => [
                        'pendente' => $taskStats->pendente,
                        'em_andamento' => $taskStats->em_andamento,
                        'concluida' => $taskStats->concluida,
                    ]
                ],
                'recent_projects' => Project::with('creator:id,name') 
                    ->select('id', 'name', 'status', 'created_by', 'created_at')
                    ->orderBy('created_at', 'desc')
                    ->take(5)
                    ->get()
            ]);
        }

        $activeProject = $user->activeProject;
        $projectData = null;

        if ($activeProject) {
            
            $stats = $activeProject->tasks()
                ->selectRaw("
                    count(*) as total,
                    count(case when status = 'pendente' then 1 end) as pendente,
                    count(case when status = 'em andamento' then 1 end) as em_andamento,
                    count(case when status = 'concluida' then 1 end) as concluida
                ")
                ->first();

            $progress = $stats->total > 0 ? round(($stats->concluida / $stats->total) * 100) : 0;

            $myTasks = $activeProject->tasks()
                ->select('id', 'title', 'status', 'deadline', 'project_id') 
                ->orderBy('deadline', 'asc')
                ->take(6)
                ->get();

            $projectData = [
                'id' => $activeProject->id,
                'name' => $activeProject->name,
                'status' => $activeProject->status,
                'progress' => $progress,
                'my_tasks' => $myTasks,
                'stats' => [
                    'pendente' => $stats->pendente,
                    'em_andamento' => $stats->em_andamento,
                    'concluida' => $stats->concluida,
                ]
            ];
        }

        return Inertia::render('dashboard', [
            'auth' => ['user' => $user],
            'type' => 'U',
            'active_project' => $projectData,
            'my_projects_count' => $user->projects()->count()
        ]);
    }

}
