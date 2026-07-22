import { create } from 'zustand';

export interface SessionIdCard {
  id: string;
  frontImage: string;
  backImage: string;
  copies: number;
  label?: string;
}

interface IdCardSessionState {
  cards: SessionIdCard[];
  addOrUpdateCard: (card: SessionIdCard) => void;
  removeCard: (id: string) => void;
  setCardCopies: (id: string, copies: number) => void;
  clear: () => void;
}

export const useIdCardSessionStore = create<IdCardSessionState>((set) => ({
  cards: [],
  addOrUpdateCard: (card) =>
    set((state) => {
      const index = state.cards.findIndex((c) => c.id === card.id);
      if (index === -1) {
        return { cards: [...state.cards, card] };
      }
      const next = [...state.cards];
      next[index] = card;
      return { cards: next };
    }),
  removeCard: (id) =>
    set((state) => ({ cards: state.cards.filter((c) => c.id !== id) })),
  setCardCopies: (id, copies) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === id ? { ...c, copies: Math.max(1, copies) } : c
      ),
    })),
  clear: () => set({ cards: [] }),
}));
