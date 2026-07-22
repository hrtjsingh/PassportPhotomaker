import { create } from 'zustand';

export interface SessionPhoto {
  id: string;
  passportPhoto: string;
  widthMm: number;
  heightMm: number;
  bgColor: string;
  copies: number;
  sizeLabel?: string;
}

interface PhotoSessionState {
  photos: SessionPhoto[];
  addOrUpdatePhoto: (photo: SessionPhoto) => void;
  removePhoto: (id: string) => void;
  setPhotoCopies: (id: string, copies: number) => void;
  clear: () => void;
}

export const usePhotoSessionStore = create<PhotoSessionState>((set) => ({
  photos: [],
  addOrUpdatePhoto: (photo) =>
    set((state) => {
      const index = state.photos.findIndex((p) => p.id === photo.id);
      if (index === -1) {
        return { photos: [...state.photos, photo] };
      }
      const next = [...state.photos];
      next[index] = photo;
      return { photos: next };
    }),
  removePhoto: (id) =>
    set((state) => ({ photos: state.photos.filter((p) => p.id !== id) })),
  setPhotoCopies: (id, copies) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === id ? { ...p, copies: Math.max(1, copies) } : p
      ),
    })),
  clear: () => set({ photos: [] }),
}));
