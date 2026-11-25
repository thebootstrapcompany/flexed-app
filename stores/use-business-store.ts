import { create } from "zustand";

export interface Business {
    id: string;
    name: string;
    username: string;
    created_at: string;
}

interface BusinessStore {
    businesses: Business[];
    loaded: boolean;
    setBusinesses: (items: Business[]) => void;
    addBusiness: (item: Business) => void;
    clearBusinesses: () => void;
}

export const useBusinessStore = create<BusinessStore>((set) => ({
    businesses: [],
    loaded: false,
    setBusinesses: (items) => set({ businesses: items, loaded: true }),
    addBusiness: (item) => set((s) => ({ businesses: [item, ...s.businesses] })),
    clearBusinesses: () => set({ businesses: [], loaded: false }),
}));
