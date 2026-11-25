import { create } from "zustand";

export interface Touchpoint {
    code: string;
    name: string | null;
    username: string | null;
    links: Record<string, unknown>;
    createdAt: string;
}

interface TouchpointStore {
    touchpoints: Touchpoint[];
    userId: string | null;
    loaded: boolean;
    setTouchpoints: (touchpoints: Touchpoint[], userId: string) => void;
    clearTouchpoints: () => void;
}

export const useTouchpointStore = create<TouchpointStore>((set) => ({
    touchpoints: [],
    userId: null,
    loaded: false,
    setTouchpoints: (touchpoints, userId) => set({ touchpoints, userId, loaded: true }),
    clearTouchpoints: () => set({ touchpoints: [], userId: null, loaded: false })
}));
