import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { LANGUAGES } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcher = ({ className = "" }: { className?: string }) => {
  const { i18n } = useTranslation();
  const current = LANGUAGES.find((l) => i18n.language?.startsWith(l.code)) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Sprache wählen"
        className={`inline-flex items-center gap-1.5 font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors ${className}`}
      >
        <Globe className="w-4 h-4" strokeWidth={1.5} />
        {current.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9rem]">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => i18n.changeLanguage(l.code)}
            className={`font-body text-sm ${l.code === current.code ? "text-primary" : ""}`}
          >
            {l.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
