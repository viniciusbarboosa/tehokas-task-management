<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'status',
        'created_by', 
    ];


    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * RELAÇOES
     */
    public function users()
    {
        return $this->belongsToMany(User::class)
                    ->withPivot('project_id', 'user_id');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Verificar se usuário tem acesso
     */
    public function isAccessibleBy(User $user)
    {
        return $user->isAdmin() || 
               $this->users()->where('user_id', $user->id)->exists() ||
               $this->created_by === $user->id;
    }

    /**
     * Escopo para projetos acessíveis
     */
    public function scopeAccessibleBy($query, User $user)
    {
        if ($user->isAdmin()) {
            return $query;
        }

        return $query->where(function ($q) use ($user) {
            $q->whereHas('users', function ($subQ) use ($user) {
                $subQ->where('user_id', $user->id);
            })->orWhere('created_by', $user->id);
        });
    }
}
