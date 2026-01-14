<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:A,U',
            'per_page' => 'nullable|integer|min:5|max:100',
        ]);

        $query = User::query();

        if (!empty($validated['search'] ?? '')) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($validated['type'] ?? '')) {
            $query->where('type', $validated['type']);
        }

        $perPage = $validated['per_page'] ?? 15;
        $users = $query->orderBy('name', 'asc')->paginate($perPage);
        
        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => [
                'search' => $validated['search'] ?? '',
                'type' => $validated['type'] ?? '',
                'per_page' => $perPage,
            ],
            'authUser' => auth()->user(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'type' => 'nullable|string', 
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'type' => $request->type,
        ]);

        return redirect()->route('usuarios.index')->with('success', 'Usuário criado com sucesso.');
    }

    public function update(Request $request, User $usuario) 
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$usuario->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'type' => 'nullable|string',
        ]);

        $usuario->fill($request->except('password'));

        if ($request->filled('password')) {
            $usuario->password = Hash::make($request->password);
        }

        $usuario->save();

        return redirect()->route('usuarios.index')->with('success', 'Usuário atualizado com sucesso.');
    }

    public function destroy(User $usuario)
    {
        $usuario->delete();
        return redirect()->route('usuarios.index')->with('success', 'Usuário excluído com sucesso.');
    }
}
