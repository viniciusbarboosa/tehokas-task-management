<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\User;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        
        if (!$user) {
            $user = User::factory()->create();
        }

        $statuses = ['em andamento', 'alerta', 'finalizado'];
        
        for ($i = 1; $i <= 50; $i++) {
            Project::create([
                'name' => 'Projeto ' . $i . ' - ' . fake()->words(2, true),
                'status' => $statuses[array_rand($statuses)],
                'created_by' => $user->id,
            ]);
        }
    }
}
