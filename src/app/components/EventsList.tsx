// ~/Documents/web/Agenda-AI/src/app/components/EventsList.tsx
'use client'; // Esto es un Client Component

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchEvents } from '@/store/slices/eventSlice'; // Importa el thunk de eventos
import { Event } from '@/store/slices/eventSlice'; // Importa la interfaz Event

const EventsList = () => {
  const dispatch: AppDispatch = useDispatch();
  const { events, loading, error } = useSelector((state: RootState) => state.events);

  useEffect(() => {
    dispatch(fetchEvents()); // Llama al thunk para obtener eventos
  }, [dispatch]);

  if (loading) return <p>Cargando eventos...</p>;
  if (error) return <p className="text-red-500">Error al cargar eventos: {error}</p>;

  // Función para formatear fechas y horas para una mejor visualización
  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      // Opciones para formatear la fecha y hora
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, // true para AM/PM, false para formato 24h
      };
      return date.toLocaleDateString('es-ES', options); // 'es-ES' para formato español
    } catch (e) {
      console.error('Error formatting date:', e, isoString);
      return isoString; // Devuelve el string original si hay un error de formato
    }
  };

  return (
    <div className="p-4 bg-gray-700 rounded-lg mt-8">
      <h2 className="text-xl font-bold mb-4 text-white">Eventos</h2>
      {events.length === 0 ? (
        <p className="text-gray-400">No hay eventos disponibles. Intenta crear uno desde tu API.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="bg-gray-600 p-4 rounded-md shadow text-white border-l-4 border-blue-500">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-lg">{event.title}</span>
                <span className="text-sm text-gray-300">Prioridad: {event.priority}</span>
              </div>
              {event.description && <p className="text-sm text-gray-300 mb-1">{event.description}</p>}
              <p className="text-xs text-gray-400">
                Inicio: {formatDateTime(event.startTime)}
                {event.endTime && ` - Fin: ${formatDateTime(event.endTime)}`}
              </p>
              {event.location && <p className="text-xs text-gray-400">Lugar: {event.location}</p>}
              {event.user && <p className="text-xs text-gray-400">Creado por: {event.user.username}</p>}
              {event.isAllDay && <span className="text-xs text-indigo-300 bg-indigo-800 px-2 py-0.5 rounded-full mt-1 inline-block">Día Completo</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventsList;