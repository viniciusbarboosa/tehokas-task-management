<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateAdminMainSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //CRIAR USUARIO ADMIN PRINCIPAL DA TEHOKAS
        User::firstOrCreate(
            [
                'email' => 'tehokassolucoes@gmail.com', 
            ],
            [
                'name' => 'tehokas',
                'password' => Hash::make('tehokas123'),
                'type' => 'A',
            ]
        );
    }
}
