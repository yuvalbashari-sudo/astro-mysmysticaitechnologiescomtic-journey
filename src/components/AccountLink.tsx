import { useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n";
import { accountScope, subscribeAccount } from "@/lib/accountName";

const labels = {
  he: ["כניסה עם מייל", "החשבון שלי"],
  en: ["Email sign-in", "My account"],
  ar: ["الدخول بالبريد", "حسابي"],
  ru: ["Вход по почте", "Мой аккаунт"],
};

export default function AccountLink() {
  const { language } = useLanguage();
  const scope = useSyncExternalStore(subscribeAccount, accountScope);
  return <Link to="/account" className="inline-flex min-h-11 items-center rounded-lg px-2 font-body text-sm text-gold underline-offset-4 hover:underline">
    {labels[language][scope === "guest" || scope === "loading" ? 0 : 1]}
  </Link>;
}
