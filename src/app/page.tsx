// ~/Documents/web/Agenda-AI/src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchUsers } from '@/store/slices/userSlice';
import { fetchTasks, updateTask } from '@/store/slices/taskSlice';
import { Task } from '@/store/slices/taskSlice';

// Importa el nuevo componente EventsList
import EventsList from './components/EventsList'; // Asegúrate que la ruta sea correcta

// Componente para una lista de usuarios (sin cambios)
const UsersList = () => {
  const dispatch: AppDispatch = useDispatch();
  const { users, loading, error } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p className="text-red-500">Error al cargar usuarios: {error}</p>;

  return (
    <div className="p-4 bg-gray-700 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Usuarios</h2>
      {users.length === 0 ? (
        <p className="text-gray-400">No hay usuarios disponibles. Intenta crear uno desde tu API.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="bg-gray-600 p-3 rounded-md shadow flex justify-between items-center text-white">
              <span>{user.username} ({user.email})</span>
              <span className="text-sm text-gray-300">ID: {user.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Componente para una lista de tareas (sin cambios)
const TasksList = () => {
  const dispatch: AppDispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleToggleComplete = (task: Task) => {
    dispatch(updateTask({ id: task.id, isCompleted: !task.isCompleted }));
  };

  if (loading) return <p>Cargando tareas...</p>;
  if (error) return <p className="text-red-500">Error al cargar tareas: {error}</p>;

  return (
    <div className="p-4 bg-gray-700 rounded-lg mt-8">
      <h2 className="text-xl font-bold mb-4 text-white">Tareas</h2>
      {tasks.length === 0 ? (
        <p className="text-gray-400">No hay tareas disponibles. Intenta crear una desde tu API.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className={`bg-gray-600 p-3 rounded-md shadow text-white flex items-center justify-between ${task.isCompleted ? 'line-through opacity-70' : ''}`}>
              <div>
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => handleToggleComplete(task)}
                  className="mr-2 h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="font-semibold">{task.title}</span>
                {task.description && <p className="text-sm text-gray-300">{task.description}</p>}
                {task.dueDate && <p className="text-xs text-gray-400">Vence: {task.dueDate} {task.dueTime}</p>}
              </div>
              <span className="text-sm text-gray-300">Prioridad: {task.priority}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-800 text-white">
      <h1 className="text-3xl font-bold mb-8">Bienvenido a tu Agenda AI</h1>
      <div className="w-full max-w-2xl">
        <UsersList />
        <TasksList />
        <EventsList /> {/* ¡Añade este componente aquí! */}
      </div>
    </main>
  );
}