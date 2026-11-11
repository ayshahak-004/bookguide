import { LanguageToggle } from "./LanguageToggle";

export function TopBar() {
  return (
    <header className="flex items-center justify-between rounded-2xl bg-navy px-5 py-4 text-white shadow-sm">
      <span className="text-lg font-bold">دليل الكتب</span>
      <LanguageToggle variant="dark" />
    </header>
  );
}
