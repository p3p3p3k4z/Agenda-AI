// ~/Documents/web/Agenda-AI/src/app/providers.tsx
'use client'; // Indica que es un Client Component

import { Provider } from 'react-redux';
import { store } from '@/store'; // Importa tu store de Redux

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}