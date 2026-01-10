<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/usuarios', [UserController::class, 'index'])->name('usuarios.index');
    Route::post('/usuarios', [UserController::class, 'store'])->name('usuarios.store');
    Route::put('/usuarios/{usuario}', [UserController::class, 'update'])->name('usuarios.update');
    Route::delete('/usuarios/{usuario}', [UserController::class, 'destroy'])->name('usuarios.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/projetos', [ProjectController::class, 'index'])->name('projetos.index');
    Route::post('/projetos', [ProjectController::class, 'store'])->name('projetos.store');
    Route::put('/projetos/{projeto}', [ProjectController::class, 'update'])->name('projetos.update');
    Route::delete('/projetos/{projeto}', [ProjectController::class, 'destroy'])->name('projetos.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/projetos/acessiveis', [ProjectController::class, 'accessible'])->name('projetos.acessiveis');
    Route::post('/projeto/ativo', [ProjectController::class, 'setActive'])->name('projeto.ativo');
    Route::get('/projeto/ativo', [ProjectController::class, 'getActive'])->name('projeto.ativo.get');
});

require __DIR__.'/settings.php';
