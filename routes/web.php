<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
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
    Route::get('/usuarios', [UserController::class, 'index'])->name('usuarios.index')->middleware('admin.only');;
    Route::post('/usuarios', [UserController::class, 'store'])->name('usuarios.store');
    Route::put('/usuarios/{usuario}', [UserController::class, 'update'])->name('usuarios.update');
    Route::delete('/usuarios/{usuario}', [UserController::class, 'destroy'])->name('usuarios.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/projetos', [ProjectController::class, 'index'])->name('projetos.index')->middleware('admin.only');;
    Route::post('/projetos', [ProjectController::class, 'store'])->name('projetos.store');
    Route::put('/projetos/{projeto}', [ProjectController::class, 'update'])->name('projetos.update');
    Route::delete('/projetos/{projeto}', [ProjectController::class, 'destroy'])->name('projetos.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/projetos/acessiveis', [ProjectController::class, 'accessible'])->name('projetos.acessiveis');
    Route::post('/projeto/ativo', [ProjectController::class, 'setActive'])->name('projeto.ativo');
    Route::get('/projeto/ativo', [ProjectController::class, 'getActive'])->name('projeto.ativo.get');
    Route::get('/projetos/{projeto}/usuarios', [ProjectController::class, 'getUsers']);
    Route::get('/projetos/{projeto}/buscar-usuarios-disponiveis', [ProjectController::class, 'searchAvailableUsers']);
    Route::post('/projetos/{projeto}/adicionar-usuario', [ProjectController::class, 'addUser']);
    Route::post('/projetos/{projeto}/remover-usuario', [ProjectController::class, 'removeUser']);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/tarefas', [TaskController::class, 'index'])->name('tarefas.index');
    Route::post('/tarefas', [TaskController::class, 'store']);
    Route::put('/tarefas/{task}', [TaskController::class, 'update']);
    Route::put('/tarefas/{task}/status', [TaskController::class, 'updateStatus']);
    Route::delete('/tarefas/{task}', [TaskController::class, 'destroy']);
    Route::get('/projetos/{project}/tarefas', [TaskController::class, 'getByProject']);
});

require __DIR__.'/settings.php';
