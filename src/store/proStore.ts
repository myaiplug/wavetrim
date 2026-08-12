"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProState {
  isPro: boolean;
  unlock: () => void;
  lock: () => void;
}

export const useProStore = create<ProState>()(
  persist(
    (set) => ({
      isPro: false,
      unlock: () => set({ isPro: true }),
      lock: () => set({ isPro: false }),
    }),
    {
      name: "nodaw-wavetrim-pro",
    }
  )
);
