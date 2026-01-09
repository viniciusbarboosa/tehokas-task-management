<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //DADOS FAKES GERADOS
        $admins = [
            [
                'name' => 'Administrador Sistema',
                'email' => 'admin@sistema.com',
                'password' => Hash::make('admin123'),
                'type' => 'A',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Maria Silva',
                'email' => 'maria.admin@empresa.com',
                'password' => Hash::make('senha123'),
                'type' => 'A',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Carlos Souza',
                'email' => 'carlos.admin@empresa.com',
                'password' => Hash::make('senha123'),
                'type' => 'A',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Ana Costa',
                'email' => 'ana.admin@empresa.com',
                'password' => Hash::make('senha123'),
                'type' => 'A',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Roberto Santos',
                'email' => 'roberto.admin@empresa.com',
                'password' => Hash::make('senha123'),
                'type' => 'A',
                'email_verified_at' => now(),
            ],
        ];

        $firstNames = [
            'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Mariana', 'Paulo', 'Julia', 
            'Lucas', 'Fernanda', 'Ricardo', 'Patricia', 'Marcos', 'Camila', 'Rafael',
            'Amanda', 'Diego', 'Letícia', 'Rodrigo', 'Beatriz', 'Guilherme', 'Larissa',
            'Gabriel', 'Carolina', 'Felipe', 'Vanessa', 'Daniel', 'Tatiane', 'Bruno',
            'Renata', 'Leonardo', 'Bianca', 'Eduardo', 'Monique', 'Thiago', 'Priscila',
            'Alexandre', 'Débora', 'André', 'Simone', 'Vinícius', 'Natália', 'Rogério',
            'Cristiane', 'Wagner', 'Elaine', 'Maurício', 'Sandra', 'Hugo', 'Rosangela'
        ];

        $lastNames = [
            'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
            'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
            'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha',
            'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Mendes',
            'Freitas', 'Barros', 'Castro', 'Cardoso', 'Teixeira', 'Correia', 'Moraes',
            'Cavalcanti', 'Dantas', 'Cunha', 'Ramos', 'Reis', 'Araújo', 'Machado'
        ];

        $companies = [
            'empresa.com', 'negocio.com.br', 'corporacao.com', 'startup.io',
            'tech.com', 'digital.com.br', 'inovacao.com', 'solutions.com',
            'global.com', 'network.com.br', 'group.com', 'enterprise.com'
        ];

        foreach ($admins as $admin) {
            User::create($admin);
        }

        for ($i = 1; $i <= 55; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $company = $companies[array_rand($companies)];
            
            $type = rand(1, 100) <= 20 ? 'A' : 'U';
            
            User::create([
                'name' => "{$firstName} {$lastName}",
                'email' => Str::lower("{$firstName}.{$lastName}.{$i}@{$company}"),
                'password' => Hash::make('senha123'), 
                'type' => $type,
                'email_verified_at' => rand(0, 1) ? now() : null, 
                'created_at' => now()->subDays(rand(1, 365)), 
            ]);
        }

        $this->command->info('60 usuários criados com sucesso!');
        $this->command->info('5 administradores');
        $this->command->info('55 usuários (alguns administradores)');
        $this->command->info('Senha padrão: senha123');
        $this->command->info('Alguns emails não verificados');
    }
}
