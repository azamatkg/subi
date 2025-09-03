import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Language } from '@/types';

const languageOptions = [
  { code: Language.KG, name: 'Кыргызча', flag: '🇰🇬' },
  { code: Language.RU, name: 'Русский', flag: '🇷🇺' },
  { code: Language.EN, name: 'English', flag: '🇺🇸' },
];

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'ghost',
  size = 'default',
  showText = false,
}) => {
  const { currentLanguage, changeLanguage } = useTranslation();

  const currentLangOption = languageOptions.find(
    (option) => option.code === currentLanguage
  ) || languageOptions[1]; // Default to Russian

  const handleLanguageChange = (language: Language) => {
    changeLanguage(language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Languages className="h-4 w-4" />
          {showText && (
            <span className="ml-2">
              {currentLangOption.flag} {currentLangOption.name}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => handleLanguageChange(option.code)}
            className={`cursor-pointer ${
              currentLanguage === option.code 
                ? 'bg-accent text-accent-foreground' 
                : ''
            }`}
          >
            <span className="mr-2">{option.flag}</span>
            {option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};