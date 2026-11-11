export interface Region {
  id: string; // matches the Arabic keys used in data/delivery.json
  ar: string;
  en: string;
}

export const REGIONS: Region[] = [
  { id: "مسقط", ar: "مسقط", en: "Muscat" },
  { id: "ظفار", ar: "ظفار", en: "Dhofar" },
  { id: "مسندم", ar: "مسندم", en: "Musandam" },
  { id: "البريمي", ar: "البريمي", en: "Al Buraimi" },
  { id: "الداخلية", ar: "الداخلية", en: "Ad Dakhiliyah" },
  { id: "شمال الباطنة", ar: "شمال الباطنة", en: "North Al Batinah" },
  { id: "جنوب الباطنة", ar: "جنوب الباطنة", en: "South Al Batinah" },
  { id: "جنوب الشرقية", ar: "جنوب الشرقية", en: "South Al Sharqiyah" },
  { id: "شمال الشرقية", ar: "شمال الشرقية", en: "North Al Sharqiyah" },
  { id: "الظاهرة", ar: "الظاهرة", en: "Ad Dhahirah" },
  { id: "الوسطى", ar: "الوسطى", en: "Al Wusta" },
];

const STORAGE_KEY = "selectedRegion";

export function loadSavedRegion(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveRegion(regionId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, regionId);
  } catch {
    // localStorage unavailable (private mode, disabled, etc.) - ignore
  }
}
