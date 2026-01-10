<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'type',
        'active_project_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    //CARREGAR PRA SEMPRE O PROJETO ATIVO
    protected $with = ['activeProject'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * RELAÇOES
     */
    public function projects()
    {
        return $this->belongsToMany(Project::class)
            ->withTimestamps();
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    public function activeProject(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'active_project_id');
    }

    //METODOS
    public function isAdmin(): bool
    {
        return $this->type === 'A';
    }

    public function isUser(): bool
    {
        return $this->type === 'U';
    }

    /**
     * Obter projetos acessíveis (com paginação para scroll infinito)
     */
    public function accessibleProjects(int $page = 1, int $perPage = 20, string $search = '')
    {
        $query = Project::query();

        if (!$this->isAdmin()) {
            $query->where(function ($q) {
                $q->whereHas('users', function ($sub) {
                    $sub->where('user_id', $this->id);
                })
                    ->orWhere('created_by', $this->id);
            });
        }

        if ($search !== '') {
            $query->where('name', 'like', "%{$search}%");
        }

        return $query
            ->with(['creator:id,name'])
            ->withCount('users')
            ->orderBy('name')
            ->paginate($perPage, ['id', 'name', 'status', 'created_by'], 'page', $page);
    }


    /**
     * Alterar projeto ativo
     */
    public function setActiveProject(Project $project): bool
    {
        // Verificar acesso
        if (!$this->canAccessProject($project)) {
            return false;
        }

        $this->active_project_id = $project->id;
        return $this->save();
    }

    /**
     * Verificar se usuário tem acesso ao projeto
     */
    public function canAccessProject(Project $project): bool
    {
        return $this->isAdmin() ||
            $project->users()->where('user_id', $this->id)->exists() ||
            $project->created_by === $this->id;
    }
}
