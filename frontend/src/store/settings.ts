import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  defaultCountry: string;
  defaultEntity: "iPhone" | "iPad";
  setDefaultCountry: (country: string) => void;
  setDefaultEntity: (entity: "iPhone" | "iPad") => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultCountry: "US",
      defaultEntity: "iPhone",
      setDefaultCountry: (country) => set({ defaultCountry: country }),
      setDefaultEntity: (entity) => set({ defaultEntity: entity }),
    }),
    {
      name: "asspp-settings",
    },
  ),
);
