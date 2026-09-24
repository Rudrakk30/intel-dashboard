import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Event } from '@/types';

interface SavedState {
  savedEvents: Event[];
  saveEvent: (event: Event) => void;
  removeEvent: (eventId: string) => void;
  isSaved: (eventId: string) => boolean;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedEvents: [],
      saveEvent: (event) => set((state) => {
        if (state.savedEvents.find(e => e.id === event.id)) return state;
        return { savedEvents: [...state.savedEvents, event] };
      }),
      removeEvent: (eventId) => set((state) => ({
        savedEvents: state.savedEvents.filter((e) => e.id !== eventId)
      })),
      isSaved: (eventId) => get().savedEvents.some((e) => e.id === eventId),
    }),
    {
      name: 'intel-saved-news',
    }
  )
);
