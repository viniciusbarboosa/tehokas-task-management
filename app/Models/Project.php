<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
                    ->withTimestamps();
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }
}
